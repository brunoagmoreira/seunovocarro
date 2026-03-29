import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.vehiclesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: User) {
    return this.vehiclesService.findForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  getMetrics(@CurrentUser() user: User, @Query('period') period?: string) {
    const days = period ? parseInt(period) : 30;
    return this.vehiclesService.getMetrics(user.id, days);
  }
Applied Lints: [7661a21b-2f7a-4e6a-adb1-e5ded1cf4717]

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.vehiclesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @CurrentUser() user: User) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: User,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.vehiclesService.remove(id, user);
  }
}
