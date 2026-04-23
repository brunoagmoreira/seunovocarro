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

  @Get('dealer-plans')
  listDealerPlans(@CurrentUser() user: User) {
    return this.adminService.listDealerPlans(user);
  }

  @Patch('dealer-plans/billing-config')
  updateBillingConfig(
    @CurrentUser() user: User,
    @Body() body: {
      asaas_enabled?: boolean;
      asaas_api_url?: string;
      asaas_api_key?: string;
      default_billing_type?: string;
      default_frequency?: string;
    },
  ) {
    return this.adminService.updateBillingConfig(user, body);
  }

  @Patch('dealer-plans/:slug')
  updateDealerPlan(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() body: {
      price?: number;
      duration_days?: number;
      billing_enabled?: boolean;
      billing_frequency?: string;
      max_vehicles?: number;
      xml_enabled?: boolean;
      sdr_enabled?: boolean;
      sdr_whatsapp?: string;
    },
  ) {
    return this.adminService.updateDealerPlan(user, slug, body);
  }

  @Patch('dealer-plans/dealers/:dealerId')
  assignDealerPlan(
    @CurrentUser() user: User,
    @Param('dealerId') dealerId: string,
    @Body() body: { plan_slug: string },
  ) {
    return this.adminService.assignDealerPlan(user, dealerId, body.plan_slug);
  }

  @Patch('dealer-plans/dealers/:dealerId/billing')
  updateDealerBilling(
    @CurrentUser() user: User,
    @Param('dealerId') dealerId: string,
    @Body()
    body: {
      custom_price?: number | null;
      discount_percent?: number | null;
      discount_fixed?: number | null;
    },
  ) {
    return this.adminService.updateDealerBilling(user, dealerId, body);
  }

  @Patch('dealer-plans/dealers/:dealerId/charge')
  chargeDealerPlan(
    @CurrentUser() user: User,
    @Param('dealerId') dealerId: string,
  ) {
    return this.adminService.chargeDealerPlan(user, dealerId);
  }
}
