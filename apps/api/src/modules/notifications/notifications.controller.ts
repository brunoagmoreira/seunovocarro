import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test-email')
  async triggerTestEmail(@CurrentUser() user: User, @Body('email') email: string) {
    if (user.role !== 'admin') return { error: 'Acesso negado' };
    
    return this.notificationsService.sendEmail(
      email || user.email,
      'Teste de Email - Antigravity',
      '<h1>Olá!</h1><p>Sistema de email configurado com sucesso.</p>'
    );
  }
}
