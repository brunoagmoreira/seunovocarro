import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import { User, Vehicle } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

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

  async create(createDto: CreateVehicleDto, user: User) {
    return this.prisma.vehicle.create({
      data: {
        ...createDto,
        user_id: user.id,
      },
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

    return this.prisma.vehicle.update({
      where: { id },
      data: updateDto,
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
}
