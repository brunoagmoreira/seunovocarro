import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() body: {
      full_name?: string;
      phone?: string;
      whatsapp?: string;
      avatar_url?: string;
      city?: string;
      state?: string;
    },
  ) {
    const { full_name, phone, whatsapp, avatar_url, city, state } = body;
    return this.usersService.updateById(user.id, {
      full_name,
      phone,
      whatsapp,
      avatar_url,
      city,
      state,
    });
  }
}
