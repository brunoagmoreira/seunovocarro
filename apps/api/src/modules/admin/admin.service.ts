import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';
import { isSuperAdminEmail } from '../../common/auth/super-admin';
import type { UpdateSiteSettingsDto } from './dto/site-settings.dto';
import type { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-users.dto';
import type { CreateAdminDealerDto, UpdateAdminDealerDto } from './dto/admin-dealers.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  private readonly billingConfigSlug = 'dealer-billing-config';

  private async ensureDealerPlans() {
    const defaults = [
      {
        slug: 'dealer-plan-1',
        name: 'Plano 1',
        price: 0,
        max_vehicles: 3,
        xml_enabled: false,
        sdr_enabled: false,
        sdr_whatsapp: '',
      },
      {
        slug: 'dealer-plan-2',
        name: 'Plano 2',
        price: 199,
        max_vehicles: 999999,
        xml_enabled: true,
        sdr_enabled: false,
        sdr_whatsapp: '',
      },
      {
        slug: 'dealer-plan-3',
        name: 'Plano 3',
        price: 499,
        max_vehicles: 999999,
        xml_enabled: true,
        sdr_enabled: true,
        sdr_whatsapp: '',
      },
    ];

    for (const plan of defaults) {
      await this.prisma.adPlan.upsert({
        where: { slug: plan.slug },
        create: {
          slug: plan.slug,
          name: plan.name,
          plan_type: 'dealer',
          price: plan.price,
          daily_budget: 0,
          duration_days: 30,
          min_vehicles: 1,
          max_vehicles: plan.max_vehicles,
          features: {
            xml_enabled: plan.xml_enabled,
            sdr_enabled: plan.sdr_enabled,
            sdr_whatsapp: plan.sdr_whatsapp,
          } as any,
        },
        update: {
          plan_type: 'dealer',
        },
      });
    }
  }

  private async ensureBillingConfig() {
    await this.prisma.adPlan.upsert({
      where: { slug: this.billingConfigSlug },
      create: {
        slug: this.billingConfigSlug,
        name: 'Configuração Billing',
        plan_type: 'system',
        price: 0,
        daily_budget: 0,
        duration_days: 30,
        min_vehicles: 0,
        max_vehicles: 0,
        features: {
          asaas_enabled: false,
          asaas_api_url: 'https://api-sandbox.asaas.com',
          asaas_api_key: '',
          default_billing_type: 'CREDIT_CARD',
          default_frequency: 'monthly',
        } as any,
      },
      update: {
        plan_type: 'system',
      },
    });
  }

  private sanitizePhone(value?: string | null) {
    if (!value) return undefined;
    const digits = String(value).replace(/\D/g, '');
    return digits || undefined;
  }

  private readonly trialEndDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  /** Data civil YYYY-MM-DD ou null. */
  private parseTrialEndsOn(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    const s = String(value).trim();
    if (!this.trialEndDatePattern.test(s)) return null;
    return s;
  }

  /** Trial ativo até o fim do dia (UTC) informado em trial_ends_on. */
  private isBillingTrialActive(billing: Record<string, unknown> | undefined): boolean {
    const on = billing?.trial_ends_on;
    if (typeof on !== 'string' || !this.trialEndDatePattern.test(on)) return false;
    const [y, m, d] = on.split('-').map(Number);
    const endUtc = Date.UTC(y, m - 1, d, 23, 59, 59, 999);
    return Date.now() <= endUtc;
  }

  private async requestAsaas<T = any>(
    cfg: { asaas_api_key?: string; asaas_api_url?: string },
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const apiKey = (cfg.asaas_api_key || '').trim();
    const apiUrl = (cfg.asaas_api_url || 'https://api-sandbox.asaas.com').trim().replace(/\/$/, '');
    if (!apiKey) {
      throw new ForbiddenException('Token da API Asaas não configurado');
    }

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
        ...(init?.headers || {}),
      },
    });

    const data = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      const message =
        data?.errors?.[0]?.description ||
        data?.errors?.[0]?.code ||
        'Falha ao comunicar com Asaas';
      throw new ForbiddenException(message);
    }
    return data as T;
  }

  checkAdmin(user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  checkSuperAdmin(user: User) {
    if (!isSuperAdminEmail(user.email)) {
      throw new ForbiddenException('Acesso restrito a super administradores');
    }
  }

  async getDashboardStats(user: User) {
    this.checkAdmin(user);

    const [totalUsers, totalDealers, totalVehicles, totalLeads] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.dealer.count(),
      this.prisma.vehicle.count(),
      this.prisma.lead.count(),
    ]);

    return {
      users: totalUsers,
      dealers: totalDealers,
      vehicles: totalVehicles,
      leads: totalLeads,
    };
  }

  private adminUserListSelect() {
    return {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      city: true,
      state: true,
      role: true,
      status: true,
      created_at: true,
      dealer: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    } as const;
  }

  async listUsers(user: User) {
    this.checkAdmin(user);
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: this.adminUserListSelect(),
    });
  }

  async createAdminUser(actor: User, dto: CreateAdminUserDto) {
    this.checkAdmin(actor);
    const role = dto.role ?? 'user';
    if (role === 'admin' && !isSuperAdminEmail(actor.email)) {
      throw new ForbiddenException(
        'Apenas super administrador pode criar usuários com papel Admin',
      );
    }
    const status = dto.status ?? 'active';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);
    const email = dto.email.trim().toLowerCase();

    const created = await this.usersService.create({
      email,
      password_hash,
      full_name: dto.full_name?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      state: dto.state?.trim().toUpperCase() || undefined,
      role,
      status,
    });

    return this.prisma.user.findUniqueOrThrow({
      where: { id: created.id },
      select: this.adminUserListSelect(),
    });
  }

  async updateAdminUser(actor: User, targetId: string, dto: UpdateAdminUserDto) {
    this.checkAdmin(actor);
    const actorIsSuper = isSuperAdminEmail(actor.email);
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });
    if (!target) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (target.role === 'admin' && actor.id !== target.id && !actorIsSuper) {
      throw new ForbiddenException(
        'Apenas super administrador pode alterar outros administradores',
      );
    }

    if (dto.role === 'admin' && !actorIsSuper) {
      throw new ForbiddenException(
        'Apenas super administrador pode atribuir papel Admin',
      );
    }

    const nextRole = dto.role ?? target.role;
    const nextStatus = dto.status ?? target.status;
    const willBeActiveAdmin = nextRole === 'admin' && nextStatus === 'active';
    const otherActiveAdmins = await this.prisma.user.count({
      where: {
        role: 'admin',
        status: 'active',
        id: { not: targetId },
      },
    });
    if (!willBeActiveAdmin && otherActiveAdmins < 1) {
      throw new ForbiddenException(
        'É necessário manter ao menos um administrador ativo no sistema',
      );
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== target.email) {
        const taken = await this.prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (taken && taken.id !== targetId) {
          throw new ConflictException('Este e-mail já está em uso');
        }
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }
    if (dto.password !== undefined && dto.password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      data.password_hash = await bcrypt.hash(dto.password, salt);
    }
    if (dto.full_name !== undefined) {
      data.full_name = dto.full_name.trim() || null;
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone?.trim() || null;
    }
    if (dto.city !== undefined) {
      data.city = dto.city?.trim() || null;
    }
    if (dto.state !== undefined) {
      data.state = dto.state?.trim().toUpperCase() || null;
    }
    if (dto.role !== undefined) {
      data.role = dto.role;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (Object.keys(data).length === 0) {
      return this.prisma.user.findUniqueOrThrow({
        where: { id: targetId },
        select: this.adminUserListSelect(),
      });
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: data as any,
    });

    return this.prisma.user.findUniqueOrThrow({
      where: { id: targetId },
      select: this.adminUserListSelect(),
    });
  }

  async deleteAdminUser(actor: User, targetId: string) {
    this.checkAdmin(actor);
    if (actor.id === targetId) {
      throw new ForbiddenException('Você não pode excluir a si mesmo');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const actorIsSuper = isSuperAdminEmail(actor.email);
    if (target.role === 'admin' && !actorIsSuper) {
      throw new ForbiddenException(
        'Apenas super administrador pode excluir administradores',
      );
    }

    if (target.role === 'admin') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Não é possível excluir o último administrador',
        );
      }
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { ok: true };
  }

  async listPendingSellerApprovals(user: User) {
    this.checkSuperAdmin(user);

    return this.prisma.user.findMany({
      where: {
        role: 'editor',
        status: 'pending',
      },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        city: true,
        state: true,
        created_at: true,
        dealer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async decideSellerApproval(
    user: User,
    targetUserId: string,
    decision: 'approve' | 'reject',
  ) {
    this.checkSuperAdmin(user);
    if (decision !== 'approve' && decision !== 'reject') {
      throw new ForbiddenException('Decisão inválida');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, status: true },
    });

    if (!target || target.role !== 'editor') {
      throw new ForbiddenException('Usuário alvo não é vendedor/lojista');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: decision === 'approve' ? 'active' : 'suspended',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
      },
    });
  }

  async listDealerPlans(user: User) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();
    await this.ensureBillingConfig();

    const [plans, dealers, billingConfig] = await Promise.all([
      this.prisma.adPlan.findMany({
        where: { plan_type: { in: ['dealer', 'system'] } },
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.dealer.findMany({
        include: {
          user: { select: { full_name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } }),
    ]);

    const billingFeatures = ((billingConfig?.features || {}) as any);
    return {
      billing_config: {
        asaas_enabled: Boolean(billingFeatures.asaas_enabled),
        asaas_api_url: billingFeatures.asaas_api_url || 'https://api-sandbox.asaas.com',
        asaas_api_key: billingFeatures.asaas_api_key || '',
        default_billing_type: billingFeatures.default_billing_type || 'CREDIT_CARD',
        default_frequency: billingFeatures.default_frequency || 'monthly',
      },
      plans: plans.filter((plan) => plan.plan_type === 'dealer').map((plan) => {
        const features = (plan.features || {}) as any;
        return {
          slug: plan.slug,
          name: plan.name,
          price: Number(plan.price || 0),
          duration_days: plan.duration_days,
          billing_enabled: features.billing_enabled ?? true,
          billing_frequency: features.billing_frequency || 'monthly',
          max_vehicles: plan.max_vehicles,
          xml_enabled: Boolean(features.xml_enabled),
          sdr_enabled: Boolean(features.sdr_enabled),
          sdr_whatsapp: features.sdr_whatsapp || '',
        };
      }),
      dealers: dealers.map((dealer) => {
        const metadata = (dealer.working_hours || {}) as any;
        const billing = (metadata.billing || {}) as any;
        return {
          id: dealer.id,
          name: dealer.name,
          slug: dealer.slug,
          owner_name: dealer.user?.full_name,
          owner_email: dealer.user?.email,
          plan_slug: metadata.dealer_plan_slug || 'dealer-plan-1',
          billing_custom_price: typeof billing.custom_price === 'number' ? billing.custom_price : null,
          billing_discount_percent: typeof billing.discount_percent === 'number' ? billing.discount_percent : null,
          billing_discount_fixed: typeof billing.discount_fixed === 'number' ? billing.discount_fixed : null,
          billing_exempt: Boolean(billing.exempt),
          billing_trial_ends_on: this.parseTrialEndsOn(billing.trial_ends_on),
          billing_trial_active: this.isBillingTrialActive(billing as Record<string, unknown>),
          asaas_customer_id: billing.asaas_customer_id || null,
          last_charge: billing.last_charge || null,
        };
      }),
    };
  }

  async updateDealerPlan(
    user: User,
    slug: string,
    data: {
      price?: number;
      duration_days?: number;
      billing_enabled?: boolean;
      billing_frequency?: string;
      max_vehicles?: number;
      xml_enabled?: boolean;
      sdr_enabled?: boolean;
      sdr_whatsapp?: string;
    },
  ) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();

    const current = await this.prisma.adPlan.findUnique({ where: { slug } });
    if (!current || current.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano de lojista não encontrado');
    }

    const features = ((current.features || {}) as any);
    return this.prisma.adPlan.update({
      where: { slug },
      data: {
        price: data.price ?? Number(current.price),
        duration_days: data.duration_days ?? current.duration_days,
        max_vehicles: data.max_vehicles ?? current.max_vehicles,
        features: {
          ...features,
          billing_enabled: data.billing_enabled ?? features.billing_enabled ?? true,
          billing_frequency: data.billing_frequency ?? features.billing_frequency ?? 'monthly',
          xml_enabled: data.xml_enabled ?? features.xml_enabled ?? false,
          sdr_enabled: data.sdr_enabled ?? features.sdr_enabled ?? false,
          sdr_whatsapp: data.sdr_whatsapp ?? features.sdr_whatsapp ?? '',
        } as any,
      },
    });
  }

  async assignDealerPlan(user: User, dealerId: string, planSlug: string) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();

    const dealer = await this.prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) throw new ForbiddenException('Lojista não encontrado');

    const plan = await this.prisma.adPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || plan.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano inválido');
    }

    const metadata = (dealer.working_hours || {}) as any;
    return this.prisma.dealer.update({
      where: { id: dealerId },
      data: {
        working_hours: {
          ...metadata,
          dealer_plan_slug: planSlug,
        } as any,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  async updateBillingConfig(
    user: User,
    data: {
      asaas_enabled?: boolean;
      asaas_api_url?: string;
      asaas_api_key?: string;
      default_billing_type?: string;
      default_frequency?: string;
    },
  ) {
    this.checkAdmin(user);
    await this.ensureBillingConfig();
    const current = await this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } });
    const features = ((current?.features || {}) as any);
    return this.prisma.adPlan.update({
      where: { slug: this.billingConfigSlug },
      data: {
        features: {
          ...features,
          asaas_enabled: data.asaas_enabled ?? features.asaas_enabled ?? false,
          asaas_api_url: data.asaas_api_url ?? features.asaas_api_url ?? 'https://api-sandbox.asaas.com',
          asaas_api_key: data.asaas_api_key ?? features.asaas_api_key ?? '',
          default_billing_type: data.default_billing_type ?? features.default_billing_type ?? 'CREDIT_CARD',
          default_frequency: data.default_frequency ?? features.default_frequency ?? 'monthly',
        } as any,
      },
    });
  }

  async updateDealerBilling(
    user: User,
    dealerId: string,
    data: {
      custom_price?: number | null;
      discount_percent?: number | null;
      discount_fixed?: number | null;
      exempt?: boolean;
      trial_ends_on?: string | null;
    },
  ) {
    this.checkAdmin(user);
    const dealer = await this.prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) throw new ForbiddenException('Lojista não encontrado');
    const metadata = (dealer.working_hours || {}) as any;
    const currentBilling = ((metadata.billing || {}) as any);

    const normalize = (value: any) =>
      value === null || value === undefined || value === '' ? null : Number(value);

    const exempt =
      data.exempt !== undefined ? Boolean(data.exempt) : Boolean(currentBilling.exempt);

    const trialEndsOn =
      data.trial_ends_on !== undefined
        ? this.parseTrialEndsOn(data.trial_ends_on)
        : this.parseTrialEndsOn(currentBilling.trial_ends_on);

    return this.prisma.dealer.update({
      where: { id: dealerId },
      data: {
        working_hours: {
          ...metadata,
          billing: {
            ...currentBilling,
            custom_price: normalize(data.custom_price),
            discount_percent: normalize(data.discount_percent),
            discount_fixed: normalize(data.discount_fixed),
            exempt,
            trial_ends_on: trialEndsOn,
          },
        } as any,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  async chargeDealerPlan(user: User, dealerId: string) {
    this.checkAdmin(user);
    await this.ensureBillingConfig();
    await this.ensureDealerPlans();

    const [dealer, billingConfigPlan] = await Promise.all([
      this.prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      }),
      this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } }),
    ]);

    if (!dealer || !dealer.user) throw new ForbiddenException('Lojista não encontrado');
    const metadata = (dealer.working_hours || {}) as any;
    const billingCfg = ((billingConfigPlan?.features || {}) as any);
    if (!billingCfg.asaas_enabled) {
      throw new ForbiddenException('Asaas está desabilitado no painel');
    }

    const planSlug = metadata.dealer_plan_slug || 'dealer-plan-1';
    const plan = await this.prisma.adPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || plan.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano do lojista não encontrado');
    }

    const billing = ((metadata.billing || {}) as any);
    if (billing.exempt === true) {
      throw new ForbiddenException(
        'Este lojista está isento de cobrança. Desative a isenção para gerar cobrança.',
      );
    }
    if (this.isBillingTrialActive(billing as Record<string, unknown>)) {
      throw new ForbiddenException(
        `Trial ativo até ${billing.trial_ends_on}. Após essa data será possível cobrar.`,
      );
    }
    const basePrice = Number(plan.price || 0);
    const customPrice = typeof billing.custom_price === 'number' ? billing.custom_price : null;
    const discountPercent = typeof billing.discount_percent === 'number' ? billing.discount_percent : 0;
    const discountFixed = typeof billing.discount_fixed === 'number' ? billing.discount_fixed : 0;
    let finalPrice = customPrice ?? basePrice;
    if (customPrice === null) {
      finalPrice = finalPrice - (finalPrice * discountPercent) / 100 - discountFixed;
    }
    finalPrice = Number(Math.max(0, finalPrice).toFixed(2));

    if (finalPrice <= 0) {
      throw new ForbiddenException('Valor final inválido para cobrança');
    }

    let asaasCustomerId = billing.asaas_customer_id || '';
    if (!asaasCustomerId) {
      const createdCustomer = await this.requestAsaas<any>(billingCfg, '/v3/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: dealer.name || dealer.user.full_name || dealer.user.email,
          email: dealer.user.email,
          mobilePhone: this.sanitizePhone(dealer.user.whatsapp || dealer.user.phone),
        }),
      });
      asaasCustomerId = createdCustomer.id;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateFormatted = dueDate.toISOString().slice(0, 10);

    const payment = await this.requestAsaas<any>(billingCfg, '/v3/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'CREDIT_CARD',
        value: finalPrice,
        dueDate: dueDateFormatted,
        description: `Plano ${plan.name} - ${dealer.name}`,
      }),
    });

    await this.prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        working_hours: {
          ...metadata,
          billing: {
            ...billing,
            asaas_customer_id: asaasCustomerId,
            last_charge: {
              id: payment.id,
              status: payment.status,
              value: payment.value,
              invoice_url: payment.invoiceUrl || null,
              created_at: new Date().toISOString(),
            },
          },
        } as any,
      },
    });

    return {
      dealer_id: dealer.id,
      plan_slug: planSlug,
      amount: finalPrice,
      asaas_payment_id: payment.id,
      status: payment.status,
      invoice_url: payment.invoiceUrl || null,
    };
  }

  private buildDealerSlug(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'loja';
  }

  private async ensureUniqueDealerSlug(
    base: string,
    excludeDealerId?: string,
  ): Promise<string> {
    let slug = base;
    let n = 1;
    for (;;) {
      const found = await this.prisma.dealer.findUnique({ where: { slug } });
      if (!found || found.id === excludeDealerId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  private mapAdminDealerRow(d: {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    verified: boolean;
    featured: boolean;
    user: {
      email: string;
      full_name: string | null;
      phone: string | null;
      city: string | null;
      state: string | null;
      _count: { vehicles: number };
    } | null;
  }) {
    const u = d.user;
    return {
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      slug: d.slug,
      dealer_name: d.name,
      dealer_slug: d.slug,
      description: d.description,
      address: d.address,
      website: d.website,
      instagram: d.instagram,
      facebook: d.facebook,
      city: u?.city ?? null,
      state: u?.state ?? null,
      phone: u?.phone ?? null,
      owner_email: u?.email ?? null,
      owner_name: u?.full_name ?? null,
      dealer_verified: d.verified,
      dealer_featured: d.featured,
      vehicle_count: u?._count?.vehicles ?? 0,
    };
  }

  async listAdminDealers(actor: User) {
    this.checkAdmin(actor);
    const rows = await this.prisma.dealer.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            city: true,
            state: true,
            _count: { select: { vehicles: true } },
          },
        },
      },
    });
    return rows.map((d) => this.mapAdminDealerRow(d));
  }

  async createAdminDealer(actor: User, dto: CreateAdminDealerDto) {
    this.checkAdmin(actor);
    const email = dto.owner_email.trim().toLowerCase();
    const owner = await this.prisma.user.findUnique({ where: { email } });
    if (!owner) {
      throw new BadRequestException(
        'Nenhum usuário com este e-mail. Cadastre o usuário em Usuários antes de vincular a loja.',
      );
    }
    const existing = await this.prisma.dealer.findUnique({ where: { user_id: owner.id } });
    if (existing) {
      throw new ConflictException('Este usuário já possui uma loja vinculada');
    }
    const base = this.buildDealerSlug(dto.slug?.trim() || dto.name);
    const slug = await this.ensureUniqueDealerSlug(base);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: owner.id },
        data: {
          role: owner.role === 'user' ? 'editor' : owner.role,
          status: owner.status === 'suspended' ? 'active' : owner.status,
        },
      });
      await tx.dealer.create({
        data: {
          user_id: owner.id,
          name: dto.name.trim(),
          slug,
        },
      });
    });

    const created = await this.prisma.dealer.findUnique({
      where: { user_id: owner.id },
      include: {
        user: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            city: true,
            state: true,
            _count: { select: { vehicles: true } },
          },
        },
      },
    });
    if (!created || !created.user) throw new NotFoundException('Falha ao criar lojista');
    return this.mapAdminDealerRow(created as any);
  }

  async updateAdminDealer(actor: User, dealerId: string, dto: UpdateAdminDealerDto) {
    this.checkAdmin(actor);
    const dealer = await this.prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        user: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            city: true,
            state: true,
            _count: { select: { vehicles: true } },
          },
        },
      },
    });
    if (!dealer || !dealer.user) throw new NotFoundException('Lojista não encontrado');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) {
      const slug = await this.ensureUniqueDealerSlug(
        this.buildDealerSlug(dto.slug),
        dealerId,
      );
      data.slug = slug;
    }
    if (dto.description !== undefined) {
      data.description = dto.description === null || dto.description === ''
        ? null
        : String(dto.description).trim();
    }
    if (dto.address !== undefined) {
      data.address =
        dto.address === null || dto.address === '' ? null : String(dto.address).trim();
    }
    if (dto.website !== undefined) {
      data.website =
        dto.website === null || dto.website === '' ? null : String(dto.website).trim();
    }
    if (dto.instagram !== undefined) {
      data.instagram =
        dto.instagram === null || dto.instagram === ''
          ? null
          : String(dto.instagram).trim();
    }
    if (dto.facebook !== undefined) {
      data.facebook =
        dto.facebook === null || dto.facebook === '' ? null : String(dto.facebook).trim();
    }
    if (dto.verified !== undefined) data.verified = dto.verified;
    if (dto.featured !== undefined) data.featured = dto.featured;

    if (Object.keys(data).length === 0) {
      return this.mapAdminDealerRow(dealer as any);
    }

    const updated = await this.prisma.dealer.update({
      where: { id: dealerId },
      data: data as any,
      include: {
        user: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            city: true,
            state: true,
            _count: { select: { vehicles: true } },
          },
        },
      },
    });
    return this.mapAdminDealerRow(updated as any);
  }

  async deleteAdminDealer(actor: User, dealerId: string) {
    this.checkAdmin(actor);
    const dealer = await this.prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) throw new NotFoundException('Lojista não encontrado');
    await this.prisma.dealer.delete({ where: { id: dealerId } });
    return { ok: true };
  }

  private async ensureSiteSettingsRow() {
    const found = await this.prisma.siteSettings.findFirst();
    if (found) return found;
    return this.prisma.siteSettings.create({ data: {} });
  }

  async getPublicSiteSettings() {
    const row = await this.ensureSiteSettingsRow();
    return {
      gtm_id: row.gtm_id,
      ga_id: row.ga_id,
      meta_pixel_id: row.meta_pixel_id,
      google_oauth_client_id: row.google_oauth_client_id,
    };
  }

  async getAdminSiteSettings(user: User) {
    this.checkAdmin(user);
    const row = await this.ensureSiteSettingsRow();
    return {
      id: row.id,
      gtm_id: row.gtm_id,
      ga_id: row.ga_id,
      meta_pixel_id: row.meta_pixel_id,
      google_oauth_client_id: row.google_oauth_client_id,
      google_oauth_client_secret_set: Boolean(row.google_oauth_client_secret?.trim()),
      updated_at: row.updated_at,
    };
  }

  async updateAdminSiteSettings(user: User, body: UpdateSiteSettingsDto) {
    this.checkAdmin(user);
    const row = await this.ensureSiteSettingsRow();
    const data: Record<string, string | null> = {};
    if (body.gtm_id !== undefined) {
      data.gtm_id = body.gtm_id?.trim() ? body.gtm_id.trim() : null;
    }
    if (body.ga_id !== undefined) {
      data.ga_id = body.ga_id?.trim() ? body.ga_id.trim() : null;
    }
    if (body.meta_pixel_id !== undefined) {
      data.meta_pixel_id = body.meta_pixel_id?.trim() ? body.meta_pixel_id.trim() : null;
    }
    if (body.google_oauth_client_id !== undefined) {
      data.google_oauth_client_id = body.google_oauth_client_id?.trim()
        ? body.google_oauth_client_id.trim()
        : null;
    }
    if (body.google_oauth_client_secret !== undefined) {
      const s = body.google_oauth_client_secret?.trim();
      data.google_oauth_client_secret = s ? s : null;
    }
    const updated = await this.prisma.siteSettings.update({
      where: { id: row.id },
      data,
    });
    return {
      id: updated.id,
      gtm_id: updated.gtm_id,
      ga_id: updated.ga_id,
      meta_pixel_id: updated.meta_pixel_id,
      google_oauth_client_id: updated.google_oauth_client_id,
      google_oauth_client_secret_set: Boolean(updated.google_oauth_client_secret?.trim()),
      updated_at: updated.updated_at,
    };
  }
}
