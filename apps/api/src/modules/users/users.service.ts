import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfileById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { dealer: true },
    });

    if (!user) return null;

    const dealerMetadata = (user.dealer?.working_hours as any) || {};
    const xmlImport = dealerMetadata?.xml_import || {};

    return {
      ...user,
      is_dealer: Boolean(user.dealer),
      dealer_name: user.dealer?.name ?? null,
      dealer_slug: user.dealer?.slug ?? null,
      dealer_description: user.dealer?.description ?? null,
      dealer_address: user.dealer?.address ?? null,
      dealer_cnpj: user.dealer?.cnpj ?? null,
      dealer_instagram: user.dealer?.instagram ?? null,
      dealer_facebook: user.dealer?.facebook ?? null,
      dealer_website: user.dealer?.website ?? null,
      dealer_logo: user.dealer?.logo_url ?? null,
      dealer_banner: user.dealer?.banner_url ?? null,
      dealer_since: user.dealer?.since ?? null,
      dealer_xml_enabled: Boolean(xmlImport.enabled),
      dealer_xml_source_url: xmlImport.source_url ?? null,
      dealer_xml_item_path: xmlImport.item_path ?? 'vehicles.vehicle',
      dealer_xml_image_path: xmlImport.image_path ?? null,
      dealer_xml_frequency_minutes: Number(xmlImport.update_frequency_minutes || 60),
      dealer_xml_field_map: xmlImport.field_map ?? {},
      dealer_xml_last_synced_at: xmlImport.last_synced_at ?? null,
      dealer_plan_slug: dealerMetadata?.dealer_plan_slug || 'dealer-plan-1',
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    password_hash: string;
    full_name?: string;
    phone?: string;
    city?: string;
    state?: string;
    role?: 'user' | 'editor' | 'admin';
    status?: 'active' | 'pending' | 'suspended';
  }): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    return this.prisma.user.create({
      data,
    });
  }

  async updateById(id: string, data: {
    full_name?: string;
    phone?: string;
    whatsapp?: string;
    avatar_url?: string;
    city?: string;
    state?: string;
  }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateProfileAndDealer(
    userId: string,
    data: {
      full_name?: string;
      phone?: string;
      whatsapp?: string;
      avatar_url?: string;
      city?: string;
      state?: string;
      is_dealer?: boolean;
      dealer_name?: string;
      dealer_slug?: string;
      dealer_description?: string;
      dealer_address?: string;
      dealer_cnpj?: string;
      dealer_instagram?: string;
      dealer_facebook?: string;
      dealer_website?: string;
      dealer_logo?: string;
      dealer_banner?: string;
      dealer_since?: string;
      dealer_xml_enabled?: boolean;
      dealer_xml_source_url?: string;
      dealer_xml_item_path?: string;
      dealer_xml_image_path?: string;
      dealer_xml_frequency_minutes?: number;
      dealer_xml_field_map?: Record<string, string>;
    },
  ) {
    const updatedUser = await this.updateById(userId, {
      full_name: data.full_name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      avatar_url: data.avatar_url,
      city: data.city,
      state: data.state,
    });

    const shouldSyncDealer =
      data.is_dealer !== undefined
      || data.dealer_name !== undefined
      || data.dealer_slug !== undefined
      || data.dealer_description !== undefined
      || data.dealer_address !== undefined
      || data.dealer_cnpj !== undefined
      || data.dealer_instagram !== undefined
      || data.dealer_facebook !== undefined
      || data.dealer_website !== undefined
      || data.dealer_logo !== undefined
      || data.dealer_banner !== undefined
      || data.dealer_since !== undefined
      || data.dealer_xml_enabled !== undefined
      || data.dealer_xml_source_url !== undefined
      || data.dealer_xml_item_path !== undefined
      || data.dealer_xml_image_path !== undefined
      || data.dealer_xml_frequency_minutes !== undefined
      || data.dealer_xml_field_map !== undefined;

    if (shouldSyncDealer) {
      if (data.is_dealer === false) {
        await this.prisma.dealer.deleteMany({ where: { user_id: userId } });
      } else {
        const existingDealer = await this.prisma.dealer.findUnique({
          where: { user_id: userId },
        });

        const name =
          data.dealer_name
          || existingDealer?.name
          || updatedUser.full_name
          || 'Minha Loja';
        const slug =
          data.dealer_slug
          || existingDealer?.slug
          || `${userId.slice(0, 8)}-loja`;

        const existingXmlImport = (existingDealer?.working_hours as any)?.xml_import || {};
        const workingHours = {
          ...((existingDealer?.working_hours as any) || {}),
          xml_import: {
            ...existingXmlImport,
            enabled: data.dealer_xml_enabled ?? existingXmlImport.enabled ?? false,
            source_url: data.dealer_xml_source_url ?? existingXmlImport.source_url ?? '',
            item_path: data.dealer_xml_item_path ?? existingXmlImport.item_path ?? 'vehicles.vehicle',
            image_path: data.dealer_xml_image_path ?? existingXmlImport.image_path ?? '',
            update_frequency_minutes: data.dealer_xml_frequency_minutes ?? existingXmlImport.update_frequency_minutes ?? 60,
            field_map: data.dealer_xml_field_map ?? existingXmlImport.field_map ?? {},
          },
        };

        await this.prisma.dealer.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            name,
            slug,
            description: data.dealer_description ?? null,
            address: data.dealer_address ?? null,
            cnpj: data.dealer_cnpj ?? null,
            instagram: data.dealer_instagram ?? null,
            facebook: data.dealer_facebook ?? null,
            website: data.dealer_website ?? null,
            logo_url: data.dealer_logo ?? null,
            banner_url: data.dealer_banner ?? null,
            since: data.dealer_since ? new Date(data.dealer_since) : null,
            working_hours: workingHours as any,
          },
          update: {
            name,
            slug,
            description: data.dealer_description ?? undefined,
            address: data.dealer_address ?? undefined,
            cnpj: data.dealer_cnpj ?? undefined,
            instagram: data.dealer_instagram ?? undefined,
            facebook: data.dealer_facebook ?? undefined,
            website: data.dealer_website ?? undefined,
            logo_url: data.dealer_logo ?? undefined,
            banner_url: data.dealer_banner ?? undefined,
            since: data.dealer_since ? new Date(data.dealer_since) : undefined,
            working_hours: workingHours as any,
          },
        });
      }
    }

    return this.getProfileById(userId);
  }
}
