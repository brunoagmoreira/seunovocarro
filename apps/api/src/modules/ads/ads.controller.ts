import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('ads')
@UseGuards(JwtAuthGuard)
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post('sync')
  async triggerSync(@CurrentUser() user: User) {
    if (user.role !== 'admin') {
      return { error: 'Acesso negado' };
    }
    return this.adsService.triggerManualSync();
  }
}
