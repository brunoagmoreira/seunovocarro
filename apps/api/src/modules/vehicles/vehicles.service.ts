import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import { User, Vehicle, MediaType } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async getCount() {
    const count = await this.prisma.vehicle.count({
      where: { status: 'approved' },
    });
    return { count };
  }

  async findFeatured(limit = 4) {
    return this.prisma.vehicle.findMany({
      where: { status: 'approved' },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async findAll(query: any) {
    // TODO: implement filters (brand, price, year, etc)
    return this.prisma.vehicle.findMany({
      where: { status: 'approved' },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.vehicle.findMany({
      include: {
        media: { orderBy: { order: 'asc' } },
        seller: {
          select: { id: true, full_name: true, city: true, state: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(id: string, status: 'approved' | 'pending' | 'draft' | 'sold' | 'expired') {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    return this.prisma.vehicle.update({
      where: { id },
      data: { status },
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
            avatar_url: true,
            city: true,
            state: true,
            phone: true,
            whatsapp: true,
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

    return vehicle;
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
    
    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
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

    // Se houver novas mídias no update, limpamos as antigas e inserimos as novas
    // Em uma versão real, você faria um diff, mas para simplificar aqui:
    if (media) {
      return this.prisma.$transaction(async (tx) => {
        await tx.vehicleMedia.deleteMany({ where: { vehicle_id: id } });
        
        return tx.vehicle.update({
          where: { id },
          data: {
            ...vehicleData,
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
      data: vehicleData,
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

  async getMetrics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, approved, pending, sold, expired] = await Promise.all([
      this.prisma.vehicle.count({ where: { user_id: userId } }),
      this.prisma.vehicle.count({ where: { user_id: userId, status: 'approved' } }),
      this.prisma.vehicle.count({ where: { user_id: userId, status: 'pending' } }),
      this.prisma.vehicle.count({ where: { user_id: userId, status: 'sold' } }),
      this.prisma.vehicle.count({ where: { user_id: userId, status: 'expired' } }),
    ]);

    return {
      total,
      approved,
      pending,
      sold,
      expired,
      period: days,
    };
  }
}
