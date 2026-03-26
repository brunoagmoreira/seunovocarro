import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  checkAdmin(user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
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

  async listUsers(user: User) {
    this.checkAdmin(user);
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
        created_at: true,
        dealer: { select: { name: true } }
      }
    });
  }
}
