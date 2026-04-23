import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { isSuperAdminEmail } from '../../common/auth/super-admin';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.getProfileById(user.id);
    return {
      ...profile,
      is_super_admin: isSuperAdminEmail(user.email),
    };
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
      is_dealer?: boolean;
      dealer_name?: string;
      dealer_slug?: string;
      dealer_description?: string;
      dealer_address?: string;
      dealer_cnpj?: string;
      dealer_instagram?: string;
      dealer_facebook?: string;
      dealer_website?: string;
      dealer_logo?: string;
      dealer_banner?: string;
      dealer_since?: string;
    },
  ) {
    return this.usersService.updateProfileAndDealer(user.id, body);
  }
}
