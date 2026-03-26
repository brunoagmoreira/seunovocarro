import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealerDto, UpdateDealerDto } from './dto/dealers.dto';
import type { User } from '@prisma/client';

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dealer.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { city: true, state: true } }
      }
    });
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
