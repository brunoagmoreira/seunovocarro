import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SiteSettingsPublicController } from './site-settings-public.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminController, SiteSettingsPublicController],
  providers: [AdminService],
})
export class AdminModule {}
