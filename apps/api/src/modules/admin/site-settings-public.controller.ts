import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Site (público)')
@Controller('site-settings')
export class SiteSettingsPublicController {
  constructor(private readonly adminService: AdminService) {}

  @Get('public')
  @ApiOperation({
    summary: 'Configurações públicas do site',
    description: 'GTM, GA, Meta Pixel e Client ID do Google (sem segredo).',
  })
  getPublic() {
    return this.adminService.getPublicSiteSettings();
  }
}
