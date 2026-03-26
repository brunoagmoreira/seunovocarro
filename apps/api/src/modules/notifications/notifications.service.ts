import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Substitui a Edge Function `send-confirmation-email`
  async sendEmail(to: string, subject: string, htmlContent: string) {
    this.logger.log(`Preparando para enviar email para ${to}. Assunto: ${subject}`);
    
    // Configuração futura do provedor de e-mail (Resend, Nodemailer, SendGrid)
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... })

    this.logger.log(`Email enviado com sucesso (simulado) para ${to}`);
    return { success: true };
  }

  // Notificação In-App
  async sendInAppNotification(userId: string, title: string, content: string) {
    // Integração com banco de dados para criar registro na tabela Notifications
    this.logger.log(`Notificação In-App criada para usuário ${userId}: ${title}`);
    return { success: true };
  }
}
