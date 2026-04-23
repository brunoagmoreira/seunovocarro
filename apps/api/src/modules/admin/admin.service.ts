import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';
import { isSuperAdminEmail } from '../../common/auth/super-admin';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

  async listUsers(user: User) {
    this.checkAdmin(user);
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
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
      },
    });
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
}
