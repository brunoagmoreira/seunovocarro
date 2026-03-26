import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
