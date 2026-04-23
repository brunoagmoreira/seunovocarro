import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { SetVehicleFeaturedDto } from './dto/vehicles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminVehicleIntegrationGuard } from '../../common/guards/admin-vehicle-integration.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

/**
 * Rotas administrativas sob o prefixo fixo `vehicles/admin`.
 * Controller separado evita qualquer ambiguidade com `GET :slug` / `PATCH :id`.
 */
@Controller('vehicles/admin')
@UseGuards(JwtAuthGuard, AdminVehicleIntegrationGuard)
export class VehiclesAdminController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('all')
  findAllAdmin(@CurrentUser() user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return this.vehiclesService.findAllAdmin();
  }

  @Patch(':id/status')
  updateVehicleStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: User,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return this.vehiclesService.updateStatus(id, body.status as any);
  }

  @Patch(':id/featured')
  setVehicleFeatured(
    @Param('id') id: string,
    @Body() body: SetVehicleFeaturedDto,
    @CurrentUser() user: User,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return this.vehiclesService.setFeaturedByAdmin(id, body.featured);
  }

  @Delete(':id')
  removeVehicleAdmin(@Param('id') id: string, @CurrentUser() user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return this.vehiclesService.remove(id, user);
  }
}
