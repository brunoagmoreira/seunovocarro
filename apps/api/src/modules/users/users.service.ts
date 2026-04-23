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
      || data.dealer_since !== undefined;

    if (shouldSyncDealer && data.is_dealer !== false) {
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
        },
      });
    }

    return this.getProfileById(userId);
  }
}
