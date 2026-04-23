import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('site-settings')
export class SiteSettingsPublicController {
  constructor(private readonly adminService: AdminService) {}

  @Get('public')
  getPublic() {
    return this.adminService.getPublicSiteSettings();
  }
}
