import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealerDto, UpdateDealerDto } from './dto/dealers.dto';
import type { User } from '@prisma/client';

type DealerWithUserCount = Awaited<
  ReturnType<DealersService['loadDealersForHomeList']>
>[number];

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  private async loadDealersForHomeList(opts?: {
    featured?: boolean;
    verified?: boolean;
    limit?: number;
  }) {
    const { featured, verified, limit } = opts || {};
    return this.prisma.dealer.findMany({
      where:
        featured !== undefined || verified !== undefined
          ? {
              ...(featured !== undefined ? { featured } : {}),
              ...(verified !== undefined ? { verified } : {}),
            }
          : undefined,
      orderBy: { created_at: 'desc' },
      ...(limit !== undefined ? { take: limit } : {}),
      include: {
        user: {
          select: {
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
            _count: { select: { vehicles: true } },
          },
        },
      },
    });
  }

  private formatDealerPublicList(d: DealerWithUserCount) {
    const u = d.user;
    return {
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      slug: d.slug,
      cnpj: d.cnpj ?? '',
      description: d.description,
      address: d.address,
      logo_url: d.logo_url,
      banner_url: d.banner_url,
      website: d.website,
      instagram: d.instagram,
      facebook: d.facebook,
      working_hours: d.working_hours,
      verified: d.verified,
      featured: d.featured,
      since: d.since?.toISOString() ?? null,
      city: u?.city ?? null,
      state: u?.state ?? null,
      phone: u?.phone ?? null,
      whatsapp: u?.whatsapp ?? null,
      dealer_slug: d.slug,
      dealer_name: d.name,
      dealer_logo: d.logo_url,
      dealer_banner: d.banner_url,
      dealer_verified: d.verified,
      dealer_since: d.since?.toISOString() ?? null,
      vehicle_count: u?._count?.vehicles ?? 0,
    };
  }

  /** Home + /dealers/featured: prioriza `featured`, depois verificados, depois qualquer loja. */
  async findFeaturedForHome() {
    const cap = 9;
    let rows = await this.loadDealersForHomeList({ featured: true, limit: cap });
    if (rows.length === 0) {
      rows = await this.loadDealersForHomeList({ verified: true, limit: cap });
    }
    if (rows.length === 0) {
      rows = await this.loadDealersForHomeList({ limit: cap });
    }
    return rows.map((d) => this.formatDealerPublicList(d));
  }

  async findAll() {
    const rows = await this.loadDealersForHomeList();
    return rows.map((d) => this.formatDealerPublicList(d));
  }

  async findBySlug(slug: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { slug },
      include: {
        user: { select: { email: true, phone: true, whatsapp: true, city: true, state: true } },
      },
    });

    if (!dealer) {
      throw new NotFoundException('Lojista não encontrado');
    }

    return dealer;
  }

  async create(createDealerDto: CreateDealerDto, user: User) {
    const existing = await this.prisma.dealer.findUnique({ where: { user_id: user.id } });
    if (existing) {
      throw new ConflictException('Usuário já possui um perfil de lojista');
    }

    return this.prisma.dealer.create({
      data: {
        ...createDealerDto,
        user_id: user.id,
      },
    });
  }

  async update(id: string, updateDealerDto: UpdateDealerDto, user: User) {
    const dealer = await this.prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      throw new NotFoundException('Lojista não encontrado');
    }

    if (dealer.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.dealer.update({
      where: { id },
      data: updateDealerDto,
    });
  }
}
