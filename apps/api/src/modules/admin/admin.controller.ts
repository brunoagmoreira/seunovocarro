import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: User) {
    return this.adminService.getDashboardStats(user);
  }

  @Get('users')
  listUsers(@CurrentUser() user: User) {
    return this.adminService.listUsers(user);
  }

  @Get('approvals/pending-sellers')
  listPendingSellerApprovals(@CurrentUser() user: User) {
    return this.adminService.listPendingSellerApprovals(user);
  }

  @Patch('approvals/sellers/:userId')
  decideSellerApproval(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Body() body: { decision: 'approve' | 'reject' },
  ) {
    return this.adminService.decideSellerApproval(user, userId, body.decision);
  }
}
