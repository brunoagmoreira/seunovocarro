import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SiteSettingsPublicController } from './site-settings-public.controller';

@Module({
  controllers: [AdminController, SiteSettingsPublicController],
  providers: [AdminService],
})
export class AdminModule {}
