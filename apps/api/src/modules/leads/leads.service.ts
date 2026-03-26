import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/leads.dto';
import { User } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: createLeadDto.vehicle_id },
      select: { user_id: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Criar o lead
    const lead = await this.prisma.lead.create({
      data: createLeadDto,
    });

    // Criar a conversa associada ao lead automaticamente
    await this.prisma.conversation.create({
      data: {
        vehicle_id: createLeadDto.vehicle_id,
        lead_id: lead.id,
        seller_id: vehicle.user_id,
      },
    });

    return lead;
  }

  async findForSeller(sellerId: string) {
    return this.prisma.lead.findMany({
      where: {
        vehicle: {
          user_id: sellerId,
        },
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            year: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
