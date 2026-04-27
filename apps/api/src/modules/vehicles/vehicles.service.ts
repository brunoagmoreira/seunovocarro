import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import {
  User,
  Vehicle,
  MediaType,
  Prisma,
  Transmission,
  FuelType,
  VehicleStatus,
  ListingType,
} from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });

  constructor(private prisma: PrismaService) {}

  private normalizeText(value: unknown): string {
    if (value === undefined || value === null) return '';
    return String(value).trim();
  }

  private normalizeNumber(value: unknown): number {
    if (value === undefined || value === null) return 0;
    const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getByPath(input: any, path?: string): unknown {
    if (!path) return undefined;
    const parts = path.split('.').filter(Boolean);
    let current: any = input;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  private listByPath(input: any, path?: string): any[] {
    if (!path) return [];
    const raw = this.getByPath(input, path);
    if (Array.isArray(raw)) return raw;
    if (raw === undefined || raw === null) return [];
    return [raw];
  }

  private generateVehicleSlug(parts: Array<string | number | undefined | null>) {
    const base = parts
      .map((part) => String(part || '').trim().toLowerCase())
      .filter(Boolean)
      .join('-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return base || `veiculo-${Date.now()}`;
  }

  private parseXmlIntegrationConfig(dealer: any) {
    const metadata = (dealer?.working_hours || {}) as any;
    const xmlImport = metadata?.xml_import || {};
    return {
      enabled: Boolean(xmlImport.enabled),
      sourceUrl: this.normalizeText(xmlImport.source_url),
      itemPath: this.normalizeText(xmlImport.item_path) || 'vehicles.vehicle',
      imagePath: this.normalizeText(xmlImport.image_path) || '',
      fieldMap: (xmlImport.field_map || {}) as Record<string, string>,
      updateFrequencyMinutes: Number(xmlImport.update_frequency_minutes) > 0
        ? Number(xmlImport.update_frequency_minutes)
        : 60,
      lastSyncedAt: xmlImport.last_synced_at ? new Date(xmlImport.last_synced_at) : null,
    };
  }

  private async upsertXmlSyncMetadata(
    dealerId: string,
    currentWorkingHours: any,
    patch: Record<string, unknown>,
  ) {
    const workingHours = (currentWorkingHours || {}) as Record<string, unknown>;
    const currentXmlImport = ((workingHours.xml_import || {}) as Record<string, unknown>);
    const next = {
      ...workingHours,
      xml_import: {
        ...currentXmlImport,
        ...patch,
      },
    };

    await this.prisma.dealer.update({
      where: { id: dealerId },
      data: {
        working_hours: next as any,
      },
    });
  }

  private async resolveDealerPlanConfigByUserId(userId: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { user_id: userId },
      select: { working_hours: true },
    });
    const metadata = (dealer?.working_hours || {}) as any;
    const planSlug = metadata?.dealer_plan_slug || 'dealer-plan-1';
    const plan = await this.prisma.adPlan.findUnique({
      where: { slug: planSlug },
      select: { max_vehicles: true, features: true },
    });
    const features = (plan?.features || {}) as any;
    return {
      slug: planSlug,
      maxVehicles: Number(plan?.max_vehicles || 3),
      xmlEnabled: Boolean(features.xml_enabled),
      sdrEnabled: Boolean(features.sdr_enabled),
      sdrWhatsapp: this.normalizeText(features.sdr_whatsapp),
    };
  }

  private async applyContactRouting<T extends { user_id: string; whatsapp?: string | null; seller?: any }>(vehicles: T[]) {
    if (!vehicles.length) return vehicles;

    const userIds = Array.from(new Set(vehicles.map((vehicle) => vehicle.user_id)));
    const dealers = await this.prisma.dealer.findMany({
      where: { user_id: { in: userIds } },
      select: { user_id: true, working_hours: true },
    });
    const planByUser = new Map<string, string>();
    for (const dealer of dealers) {
      const metadata = (dealer.working_hours || {}) as any;
      planByUser.set(dealer.user_id, metadata.dealer_plan_slug || 'dealer-plan-1');
    }

    const planSlugs = Array.from(new Set(Array.from(planByUser.values())));
    const plans = await this.prisma.adPlan.findMany({
      where: { slug: { in: planSlugs }, plan_type: 'dealer' },
      select: { slug: true, features: true },
    });
    const planFeatures = new Map<string, any>();
    for (const plan of plans) {
      planFeatures.set(plan.slug, (plan.features || {}) as any);
    }

    return vehicles.map((vehicle) => {
      const planSlug = planByUser.get(vehicle.user_id) || 'dealer-plan-1';
      const features = planFeatures.get(planSlug) || {};
      const useSdr = Boolean(features.sdr_enabled);
      const sdrWhatsapp = this.normalizeText(features.sdr_whatsapp);
      const fallbackWhatsapp = this.normalizeText(vehicle.whatsapp || vehicle.seller?.whatsapp);
      const effectiveWhatsapp = useSdr && sdrWhatsapp ? sdrWhatsapp : fallbackWhatsapp;

      return {
        ...vehicle,
        whatsapp: effectiveWhatsapp || vehicle.whatsapp,
        seller: vehicle.seller
          ? {
            ...vehicle.seller,
            whatsapp: effectiveWhatsapp || vehicle.seller.whatsapp,
          }
          : vehicle.seller,
      };
    });
  }

  async configureXmlImport(
    user: User,
    data: {
      enabled?: boolean;
      source_url?: string;
      item_path?: string;
      image_path?: string;
      update_frequency_minutes?: number;
      field_map?: Record<string, string>;
    },
  ) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { user_id: user.id },
      select: { id: true, working_hours: true },
    });
    if (!dealer) {
      throw new BadRequestException('Perfil de lojista não encontrado para este usuário.');
    }
    const dealerPlan = await this.resolveDealerPlanConfigByUserId(user.id);
    if (!dealerPlan.xmlEnabled) {
      throw new ForbiddenException('O seu plano atual não permite importação XML.');
    }

    await this.upsertXmlSyncMetadata(dealer.id, dealer.working_hours, {
      enabled: data.enabled ?? true,
      source_url: data.source_url || '',
      item_path: data.item_path || 'vehicles.vehicle',
      image_path: data.image_path || '',
      update_frequency_minutes: data.update_frequency_minutes || 60,
      field_map: data.field_map || {},
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  }

  private async importVehiclesFromXmlForDealer(
    dealer: {
      id: string;
      user_id: string;
      working_hours: unknown;
      user: { city: string | null; state: string | null; phone: string | null; whatsapp: string | null };
    },
    xmlRaw?: string,
  ) {
    const config = this.parseXmlIntegrationConfig(dealer);
    if (!config.enabled) {
      return { imported: 0, inactivated: 0, skipped: 0 };
    }
    if (!xmlRaw && !config.sourceUrl) {
      throw new BadRequestException('URL do XML não configurada para este lojista.');
    }

    let source = xmlRaw;
    if (!source) {
      const response = await fetch(config.sourceUrl);
      if (!response.ok) {
        throw new BadRequestException(`Falha ao baixar XML (${response.status})`);
      }
      source = await response.text();
    }

    const parsed = this.xmlParser.parse(source);
    const rows = this.listByPath(parsed, config.itemPath);
    if (rows.length === 0) {
      return { imported: 0, inactivated: 0, skipped: 0 };
    }

    const knownExternalIds: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const field = (name: string) => this.getByPath(row, config.fieldMap[name] || name);
      const externalId = this.normalizeText(field('external_id') || field('id') || field('code') || field('ad_code'));
      if (!externalId) {
        skipped += 1;
        continue;
      }
      knownExternalIds.push(externalId);

      const brand = this.normalizeText(field('brand'));
      const model = this.normalizeText(field('model'));
      if (!brand || !model) {
        skipped += 1;
        continue;
      }

      const imageValue = config.imagePath ? this.getByPath(row, config.imagePath) : field('image_urls');
      const imageUrls = Array.isArray(imageValue)
        ? imageValue.map((item) => this.normalizeText((item as any)?.url || item)).filter(Boolean)
        : this.normalizeText(imageValue).split(',').map((url) => this.normalizeText(url)).filter(Boolean);

      const year = Math.max(1900, Math.min(new Date().getFullYear() + 1, Number(field('year')) || new Date().getFullYear()));
      const slug = this.generateVehicleSlug([brand, model, year, externalId]);

      const payload: any = {
        brand,
        model,
        version: this.normalizeText(field('version')) || undefined,
        year,
        mileage: Math.max(0, Math.floor(this.normalizeNumber(field('mileage')))),
        transmission: this.normalizeText(field('transmission')).toLowerCase() === 'manual' ? 'manual' : 'automatic',
        fuel: ['gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid'].includes(this.normalizeText(field('fuel')).toLowerCase())
          ? this.normalizeText(field('fuel')).toLowerCase()
          : 'flex',
        color: this.normalizeText(field('color')) || undefined,
        doors: Math.max(2, Math.min(5, Number(field('doors')) || 4)),
        plate_ending: this.normalizeText(field('plate_ending')) || undefined,
        price: this.normalizeNumber(field('price')),
        description: this.normalizeText(field('description')) || undefined,
        city: this.normalizeText(field('city')) || dealer.user.city || 'Não informado',
        state: this.normalizeText(field('state')) || dealer.user.state || 'MG',
        phone: this.normalizeText(field('phone')) || dealer.user.phone || undefined,
        whatsapp: this.normalizeText(field('whatsapp')) || dealer.user.whatsapp || undefined,
        listing_type: 'sale',
        ad_code: externalId,
        slug,
      };

      const existing = await this.prisma.vehicle.findFirst({
        where: { user_id: dealer.user_id, ad_code: externalId },
        select: { id: true, status: true },
      });

      if (!existing) {
        await this.prisma.vehicle.create({
          data: {
            ...payload,
            user_id: dealer.user_id,
            status: 'pending',
            media: imageUrls.length > 0
              ? {
                create: imageUrls.map((url, order) => ({ url, order, type: 'image' as MediaType })),
              }
              : undefined,
          },
        });
        imported += 1;
      } else {
        await this.prisma.$transaction(async (tx) => {
          await tx.vehicle.update({
            where: { id: existing.id },
            data: {
              ...payload,
              status: existing.status === 'expired' ? 'pending' : existing.status,
            },
          });
          if (imageUrls.length > 0) {
            await tx.vehicleMedia.deleteMany({ where: { vehicle_id: existing.id } });
            await tx.vehicleMedia.createMany({
              data: imageUrls.map((url, order) => ({
                vehicle_id: existing.id,
                type: 'image',
                url,
                order,
              })),
            });
          }
        });
        imported += 1;
      }
    }

    let inactivated = 0;
    if (knownExternalIds.length > 0) {
      const result = await this.prisma.vehicle.updateMany({
        where: {
          user_id: dealer.user_id,
          ad_code: { notIn: knownExternalIds },
          status: { not: 'expired' },
        },
        data: { status: 'expired' },
      });
      inactivated = result.count;
    }

    await this.upsertXmlSyncMetadata(dealer.id, dealer.working_hours, {
      last_synced_at: new Date().toISOString(),
      last_sync_status: 'success',
      last_sync_error: null,
      last_sync_result: { imported, inactivated, skipped },
    });

    return { imported, inactivated, skipped };
  }

  async syncXmlImportNow(user: User, xmlContent?: string) {
    const dealerPlan = await this.resolveDealerPlanConfigByUserId(user.id);
    if (!dealerPlan.xmlEnabled) {
      throw new ForbiddenException('O seu plano atual não permite importação XML.');
    }
    const dealer = await this.prisma.dealer.findUnique({
      where: { user_id: user.id },
      select: {
        id: true,
        user_id: true,
        working_hours: true,
        user: { select: { city: true, state: true, phone: true, whatsapp: true } },
      },
    });
    if (!dealer) {
      throw new BadRequestException('Perfil de lojista não encontrado para este usuário.');
    }
    return this.importVehiclesFromXmlForDealer(dealer, xmlContent);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncScheduledXmlImports() {
    const dealers = await this.prisma.dealer.findMany({
      select: {
        id: true,
        user_id: true,
        working_hours: true,
        user: { select: { city: true, state: true, phone: true, whatsapp: true } },
      },
    });

    for (const dealer of dealers) {
      const config = this.parseXmlIntegrationConfig(dealer);
      if (!config.enabled || !config.sourceUrl) continue;

      const now = Date.now();
      const last = config.lastSyncedAt?.getTime() || 0;
      const due = now - last >= config.updateFrequencyMinutes * 60_000;
      if (!due) continue;

      try {
        await this.importVehiclesFromXmlForDealer(dealer);
      } catch (error: any) {
        this.logger.error(`Falha no sync XML do dealer ${dealer.id}: ${error?.message || error}`);
        await this.upsertXmlSyncMetadata(dealer.id, dealer.working_hours, {
          last_synced_at: new Date().toISOString(),
          last_sync_status: 'error',
          last_sync_error: error?.message || 'Erro desconhecido',
        });
      }
    }
  }

  async getCount() {
    const count = await this.prisma.vehicle.count({
      where: { status: 'approved' },
    });
    return { count };
  }

  async findFeatured(limit = 4) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: 'approved' },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            role: true,
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
            dealer: { select: { name: true, logo_url: true } },
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ featured: 'desc' }, { created_at: 'desc' }],
      take: limit,
    });
    return this.applyContactRouting(vehicles as any);
  }

  private parseQueryInt(v: unknown): number | undefined {
    if (v === undefined || v === null || v === '') return undefined;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return Number.isFinite(n) ? n : undefined;
  }

  async findAll(query: Record<string, unknown>) {
    const where: Prisma.VehicleWhereInput = {
      status: VehicleStatus.approved,
    };

    const brand = query.brand ? String(query.brand).trim() : '';
    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    const model = query.model ? String(query.model).trim() : '';
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    const yearMin = this.parseQueryInt(query.yearMin);
    const yearMax = this.parseQueryInt(query.yearMax);
    if (yearMin !== undefined || yearMax !== undefined) {
      where.year = {};
      if (yearMin !== undefined) (where.year as Prisma.IntFilter).gte = yearMin;
      if (yearMax !== undefined) (where.year as Prisma.IntFilter).lte = yearMax;
    }

    const priceMin = this.parseQueryInt(query.priceMin);
    const priceMax = this.parseQueryInt(query.priceMax);
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) (where.price as Prisma.DecimalFilter).gte = priceMin;
      if (priceMax !== undefined) (where.price as Prisma.DecimalFilter).lte = priceMax;
    }

    const mileageMin = this.parseQueryInt(query.mileageMin);
    const mileageMax = this.parseQueryInt(query.mileageMax);
    if (mileageMin !== undefined || mileageMax !== undefined) {
      where.mileage = {};
      if (mileageMin !== undefined) (where.mileage as Prisma.IntFilter).gte = mileageMin;
      if (mileageMax !== undefined) (where.mileage as Prisma.IntFilter).lte = mileageMax;
    }

    const state = query.state ? String(query.state).trim() : '';
    if (state) {
      where.state = { equals: state, mode: 'insensitive' };
    }

    const city = query.city ? String(query.city).trim() : '';
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    const transmission = query.transmission ? String(query.transmission) : '';
    if (transmission && (Object.values(Transmission) as string[]).includes(transmission)) {
      where.transmission = transmission as Transmission;
    }

    const fuel = query.fuel ? String(query.fuel) : '';
    if (fuel && (Object.values(FuelType) as string[]).includes(fuel)) {
      where.fuel = fuel as FuelType;
    }

    const acceptsTradeParam =
      query.acceptsTrade !== undefined
        ? String(query.acceptsTrade).toLowerCase()
        : query.accepts_trade !== undefined
          ? String(query.accepts_trade).toLowerCase()
          : '';
    if (acceptsTradeParam === 'true' || acceptsTradeParam === '1') {
      where.accepts_trade = true;
    } else if (acceptsTradeParam === 'false' || acceptsTradeParam === '0') {
      where.accepts_trade = false;
    }

    const sort = query.sort ? String(query.sort) : 'recent';
    let orderBy: Prisma.VehicleOrderByWithRelationInput = { created_at: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'mileage_asc':
        orderBy = { mileage: 'asc' };
        break;
      default:
        orderBy = { created_at: 'desc' };
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            role: true,
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
            dealer: { select: { name: true, logo_url: true } },
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy,
    });
    return this.applyContactRouting(vehicles as any);
  }

  /** Anúncios aprovados do lojista (página pública /loja/:slug). */
  async findApprovedByDealerSlug(dealerSlug: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { slug: dealerSlug },
      select: { user_id: true },
    });
    if (!dealer) {
      throw new NotFoundException('Lojista não encontrado');
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where: { user_id: dealer.user_id, status: VehicleStatus.approved },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            role: true,
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
            dealer: { select: { name: true, logo_url: true } },
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return this.applyContactRouting(vehicles as any);
  }

  async findAllAdmin() {
    return this.prisma.vehicle.findMany({
      include: {
        media: { orderBy: { order: 'asc' } },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
            city: true,
            state: true,
            dealer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(id: string, status: 'approved' | 'pending' | 'draft' | 'sold' | 'expired') {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    const data: { status: typeof status; featured?: boolean } = { status };
    if (status !== 'approved') {
      data.featured = false;
    }
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async setFeaturedByAdmin(id: string, featured: boolean) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (featured && vehicle.status !== 'approved') {
      throw new BadRequestException(
        'Só é possível destacar anúncios publicados (aprovados). Aprove o veículo antes.',
      );
    }
    return this.prisma.vehicle.update({
      where: { id },
      data: { featured },
      include: {
        media: { orderBy: { order: 'asc' } },
        seller: {
          select: { id: true, full_name: true, city: true, state: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            role: true,
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
            dealer: { select: { name: true, logo_url: true } },
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const [mapped] = await this.applyContactRouting([vehicle as any]);
    return mapped;
  }

  async findByIdForUser(id: string, user: User) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (vehicle.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Você não tem permissão para visualizar este veículo');
    }

    return vehicle;
  }

  async create(createDto: CreateVehicleDto, user: User) {
    const { media, ...vehicleData } = createDto;
    const listingType = (vehicleData.listing_type || 'sale') as ListingType;
    const safeVehicleData = {
      ...vehicleData,
      listing_type: listingType,
      accepts_trade: listingType === 'rental' ? false : vehicleData.accepts_trade,
    };
    const plan = await this.resolveDealerPlanConfigByUserId(user.id);
    if (plan.slug === 'dealer-plan-1') {
      const activeCount = await this.prisma.vehicle.count({
        where: {
          user_id: user.id,
          status: { notIn: ['sold', 'expired'] },
        },
      });
      if (activeCount >= plan.maxVehicles) {
        throw new BadRequestException(
          `Seu plano atual permite até ${plan.maxVehicles} veículos ativos. Faça upgrade para publicar ilimitado.`,
        );
      }
    }
    
    return this.prisma.vehicle.create({
      data: {
        ...safeVehicleData,
        user_id: user.id,
        media: media ? {
          create: media.map((m: { url: string; type: MediaType; order: number }) => ({
            url: m.url,
            type: m.type || 'image',
            order: m.order || 0
          }))
        } : undefined
      },
      include: {
        media: true
      }
    });
  }

  async update(id: string, updateDto: UpdateVehicleDto, user: User) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (vehicle.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Você só pode editar seus próprios anúncios');
    }

    const { media, ...vehicleData } = updateDto;
    const nextListingType = (vehicleData.listing_type || vehicle.listing_type) as ListingType;
    const safeVehicleData = {
      ...vehicleData,
      listing_type: nextListingType,
      accepts_trade:
        nextListingType === 'rental'
          ? false
          : vehicleData.accepts_trade,
    };

    // Se houver novas mídias no update, limpamos as antigas e inserimos as novas
    // Em uma versão real, você faria um diff, mas para simplificar aqui:
    if (media) {
      return this.prisma.$transaction(async (tx) => {
        await tx.vehicleMedia.deleteMany({ where: { vehicle_id: id } });
        
        return tx.vehicle.update({
          where: { id },
          data: {
            ...safeVehicleData,
            media: {
              create: media.map((m: { url: string; type: MediaType; order: number }) => ({
                url: m.url,
                type: m.type || 'image',
                order: m.order || 0
              }))
            }
          },
          include: { media: true }
        });
      });
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: safeVehicleData,
      include: { media: true }
    });
  }

  async remove(id: string, user: User) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (vehicle.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Você só pode remover seus próprios anúncios');
    }

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
  async findForUser(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { user_id: userId },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }


  private sanitizeTrackingPayload(body: {
    viewer_id?: string | null;
    session_id?: string | null;
    referrer?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
  }) {
    const trim = (v?: string | null) => (v && String(v).trim() ? String(v).trim() : null);
    return {
      viewer_id: trim(body.viewer_id),
      session_id: trim(body.session_id),
      referrer: trim(body.referrer),
      utm_source: trim(body.utm_source),
      utm_medium: trim(body.utm_medium),
      utm_campaign: trim(body.utm_campaign),
      utm_term: trim(body.utm_term),
      utm_content: trim(body.utm_content),
    };
  }

  async trackHomeView(body: {
    viewer_id?: string | null;
    session_id?: string | null;
    referrer?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
  }) {
    const payload = this.sanitizeTrackingPayload(body);
    await this.prisma.trackingEvent.create({
      data: {
        event_type: 'home_view',
        page: 'home',
        ...payload,
      },
    });
    return { ok: true };
  }

  async trackVehicleView(
    vehicleId: string,
    body: {
      viewer_id?: string | null;
      session_id?: string | null;
      referrer?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
    },
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');

    const payload = this.sanitizeTrackingPayload(body);

    await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { view_count: { increment: 1 } },
      }),
      this.prisma.vehicleView.create({
        data: {
          vehicle_id: vehicleId,
          viewer_id: payload.viewer_id,
          referrer: payload.referrer,
          utm_source: payload.utm_source,
          utm_medium: payload.utm_medium,
          utm_campaign: payload.utm_campaign,
          utm_term: payload.utm_term,
          utm_content: payload.utm_content,
        },
      }),
    ]);

    return { ok: true };
  }

  async trackWhatsAppClick(
    vehicleId: string,
    body: {
      viewer_id?: string | null;
      session_id?: string | null;
      referrer?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
    },
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');

    const payload = this.sanitizeTrackingPayload(body);

    await this.prisma.trackingEvent.create({
      data: {
        event_type: 'whatsapp_click',
        page: 'vehicle_detail',
        vehicle_id: vehicleId,
        ...payload,
      },
    });

    return { ok: true };
  }

  async getMetrics(userId: string, days: number = 30) {
    const period = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const vehicles = await this.prisma.vehicle.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        status: true,
        slug: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const vehicleIds = vehicles.map((v) => v.id);

    const [viewsByVehicle, whatsappByVehicle, vehicleViewUtmRows, whatsappUtmRows] = await Promise.all([
      vehicleIds.length
        ? this.prisma.vehicleView.groupBy({
            by: ['vehicle_id'],
            where: {
              vehicle_id: { in: vehicleIds },
              created_at: { gte: startDate },
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      vehicleIds.length
        ? this.prisma.trackingEvent.groupBy({
            by: ['vehicle_id'],
            where: {
              event_type: 'whatsapp_click',
              vehicle_id: { in: vehicleIds },
              created_at: { gte: startDate },
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      vehicleIds.length
        ? this.prisma.vehicleView.groupBy({
            by: ['utm_source', 'utm_medium', 'utm_campaign'],
            where: {
              vehicle_id: { in: vehicleIds },
              created_at: { gte: startDate },
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      vehicleIds.length
        ? this.prisma.trackingEvent.groupBy({
            by: ['utm_source', 'utm_medium', 'utm_campaign'],
            where: {
              event_type: 'whatsapp_click',
              vehicle_id: { in: vehicleIds },
              created_at: { gte: startDate },
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);

    const viewsMap = new Map<string, number>(
      viewsByVehicle.map((row: { vehicle_id: string; _count: { _all: number } }) => [
        row.vehicle_id,
        row._count._all,
      ]),
    );
    const whatsappMap = new Map<string, number>(
      whatsappByVehicle
        .filter((row: { vehicle_id: string | null }) => Boolean(row.vehicle_id))
        .map((row: { vehicle_id: string | null; _count: { _all: number } }) => [
          row.vehicle_id as string,
          row._count._all,
        ]),
    );

    const rows = vehicles.map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      year: v.year,
      slug: v.slug,
      status: v.status,
      views: viewsMap.get(v.id) || 0,
      whatsapp_clicks: whatsappMap.get(v.id) || 0,
      created_at: v.created_at,
    }));

    const totalVehicleViews = rows.reduce((acc, row) => acc + row.views, 0);
    const totalWhatsappClicks = rows.reduce((acc, row) => acc + row.whatsapp_clicks, 0);

    const mapUtm = (
      items: Array<{
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
        _count?: { _all?: number };
      }>,
    ) =>
      items
        .map((item) => ({
          utm_source: item.utm_source || '(direto)',
          utm_medium: item.utm_medium || '(none)',
          utm_campaign: item.utm_campaign || '(none)',
          count: item._count?._all || 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return {
      period_days: period,
      start_date: startDate,
      summary: {
        total_vehicles: rows.length,
        total_views: totalVehicleViews,
        whatsapp_clicks: totalWhatsappClicks,
      },
      vehicles: rows,
      utm: {
        vehicle_views: mapUtm(vehicleViewUtmRows),
        whatsapp_clicks: mapUtm(whatsappUtmRows),
      },
    };
  }
}
