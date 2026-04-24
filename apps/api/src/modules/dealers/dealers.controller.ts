import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { DealersService } from './dealers.service';
import { CreateDealerDto, UpdateDealerDto } from './dto/dealers.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  /** Deve ficar antes de @Get(':slug'), senão "featured" vira slug e a home perde a seção. */
  @Get('featured')
  findFeatured() {
    return this.dealersService.findFeaturedForHome();
  }

  @Get()
  findAll() {
    return this.dealersService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.dealersService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDealerDto: CreateDealerDto, @CurrentUser() user: User) {
    return this.dealersService.create(createDealerDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDealerDto: UpdateDealerDto,
    @CurrentUser() user: User,
  ) {
    return this.dealersService.update(id, updateDealerDto, user);
  }
}
