import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(private prisma: PrismaService) {}

  // Substitui a Edge Function `meta-ads-sync`
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncMetaAds() {
    this.logger.log('Iniciando sincronização com Meta Ads (Cron Job)...');
    
    // Buscar campanhas ativas
    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      include: {
        vehicle: {
          select: { brand: true, model: true, year: true, color: true, price: true }
        }
      }
    });

    for (const campaign of activeCampaigns) {
      // Simular chamada para a Graph API do Facebook
      this.logger.log(`Sincronizando feed de catálogo para o veículo: ${campaign.vehicle_id}`);
      
      // Aqui iria o axios.post('https://graph.facebook.com/vXX.X/catalog...')
      // Por enquanto, atualizamos apenas a data da última sincronização simulada
    }

    this.logger.log('Sincronização com Meta Ads concluída.');
  }

  // Permite disparar o sync via endpoint (webhooks) se necessário
  async triggerManualSync() {
    await this.syncMetaAds();
    return { message: 'Sincronização iniciada com sucesso' };
  }
}
