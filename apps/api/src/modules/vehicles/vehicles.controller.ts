import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('count')
  count() {
    return this.vehiclesService.getCount();
  }

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 4;
    return this.vehiclesService.findFeatured(Number.isNaN(parsedLimit) ? 4 : parsedLimit);
  }

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
  @Get('mine/:id')
  findMineById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.vehiclesService.findByIdForUser(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  getMetrics(@CurrentUser() user: User, @Query('period') period?: string) {
    const days = period ? parseInt(period) : 30;
    return this.vehiclesService.getMetrics(user.id, days);
  }

  @UseGuards(JwtAuthGuard)
  @Post('xml-import/config')
  configureXmlImport(
    @CurrentUser() user: User,
    @Body() body: {
      enabled?: boolean;
      source_url?: string;
      item_path?: string;
      image_path?: string;
      update_frequency_minutes?: number;
      field_map?: Record<string, string>;
    },
  ) {
    return this.vehiclesService.configureXmlImport(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('xml-import/sync-now')
  syncXmlNow(
    @CurrentUser() user: User,
    @Body() body?: { xml_content?: string },
  ) {
    return this.vehiclesService.syncXmlImportNow(user, body?.xml_content);
  }


  @Post('track-home-view')
  trackHomeView(
    @Body()
    body: {
      viewer_id?: string | null;
      session_id?: string | null;
      referrer?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
    },
  ) {
    return this.vehiclesService.trackHomeView(body);
  }

  @Post(':id/track-view')
  trackView(
    @Param('id') id: string,
    @Body()
    body: {
      viewer_id?: string | null;
      session_id?: string | null;
      referrer?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
    },
  ) {
    return this.vehiclesService.trackVehicleView(id, body);
  }

  @Post(':id/track-whatsapp-click')
  trackWhatsAppClick(
    @Param('id') id: string,
    @Body()
    body: {
      viewer_id?: string | null;
      session_id?: string | null;
      referrer?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
    },
  ) {
    return this.vehiclesService.trackWhatsAppClick(id, body);
  }


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
