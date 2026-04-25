import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-users.dto';
import { CreateAdminDealerDto, UpdateAdminDealerDto } from './dto/admin-dealers.dto';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('site-settings')
  getSiteSettings(@CurrentUser() user: User) {
    return this.adminService.getAdminSiteSettings(user);
  }

  /** POST duplicado: alguns proxies/CDNs tratam PATCH pior; o front usa POST. */
  @Patch('site-settings')
  @Post('site-settings')
  @ApiOperation({ summary: 'Atualizar pixels, Google OAuth e demais site settings' })
  updateSiteSettings(@CurrentUser() user: User, @Body() body: UpdateSiteSettingsDto) {
    return this.adminService.updateAdminSiteSettings(user, body);
  }

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: User) {
    return this.adminService.getDashboardStats(user);
  }

  @Get('metrics')
  getPlatformMetrics(@CurrentUser() user: User, @Query('period') period?: string) {
    const days = period ? parseInt(period, 10) : 30;
    return this.adminService.getPlatformMetrics(user, Number.isNaN(days) ? 30 : days);
  }

  @Get('users')
  listUsers(@CurrentUser() user: User) {
    return this.adminService.listUsers(user);
  }

  @Post('users')
  @ApiOperation({ summary: 'Criar usuário (admin). Super admin pode definir papel Admin.' })
  createUser(@CurrentUser() user: User, @Body() body: CreateAdminUserDto) {
    return this.adminService.createAdminUser(user, body);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Atualizar usuário. Senha opcional (só altera se enviada).' })
  updateUser(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Body() body: UpdateAdminUserDto,
  ) {
    return this.adminService.updateAdminUser(user, userId, body);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Excluir usuário e dados em cascata' })
  deleteUser(@CurrentUser() user: User, @Param('userId') userId: string) {
    return this.adminService.deleteAdminUser(user, userId);
  }

  @Get('dealers')
  @ApiOperation({ summary: 'Listar lojistas para gestão admin' })
  listAdminDealers(@CurrentUser() user: User) {
    return this.adminService.listAdminDealers(user);
  }

  @Post('dealers')
  @ApiOperation({ summary: 'Criar loja vinculada a usuário existente (e-mail)' })
  createAdminDealer(@CurrentUser() user: User, @Body() body: CreateAdminDealerDto) {
    return this.adminService.createAdminDealer(user, body);
  }

  @Patch('dealers/:dealerId')
  @ApiOperation({ summary: 'Editar lojista' })
  updateAdminDealer(
    @CurrentUser() user: User,
    @Param('dealerId') dealerId: string,
    @Body() body: UpdateAdminDealerDto,
  ) {
    return this.adminService.updateAdminDealer(user, dealerId, body);
  }

  @Delete('dealers/:dealerId')
  @ApiOperation({ summary: 'Excluir loja (usuário permanece; veículos ficam no usuário)' })
  deleteAdminDealer(@CurrentUser() user: User, @Param('dealerId') dealerId: string) {
    return this.adminService.deleteAdminDealer(user, dealerId);
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
  @ApiOperation({ summary: 'Listar planos de lojista, lojistas e billing Asaas' })
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
      exempt?: boolean;
      trial_ends_on?: string | null;
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
