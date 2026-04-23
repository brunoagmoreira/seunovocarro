import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Camada opcional para consumo server-to-server dos endpoints admin de veículos.
 * Se ADMIN_VEHICLE_DATA_SECRET estiver definido, exige o header X-SNC-Admin-Vehicle-Key
 * com o mesmo valor (comparação em tempo aproximadamente constante).
 */
@Injectable()
export class AdminVehicleIntegrationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.ADMIN_VEHICLE_DATA_SECRET?.trim();
    if (!secret) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const header = (req.headers['x-snc-admin-vehicle-key'] as string | undefined)?.trim() ?? '';

    const digestA = createHmac('sha256', 'snc-admin-vehicle').update(header).digest();
    const digestB = createHmac('sha256', 'snc-admin-vehicle').update(secret).digest();

    if (digestA.length !== digestB.length || !timingSafeEqual(digestA, digestB)) {
      throw new UnauthorizedException('Chave de integração ausente ou inválida');
    }

    return true;
  }
}
