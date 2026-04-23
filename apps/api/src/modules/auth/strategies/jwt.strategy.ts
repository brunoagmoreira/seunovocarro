import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { isSuperAdminEmail } from '../../../common/auth/super-admin';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-trocar-em-producao',
    });
  }

  async validate(payload: any) {
    let user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido ou usuário não encontrado');
    }

    // Keep configured super admins always active with admin role.
    if (isSuperAdminEmail(user.email) && (user.role !== 'admin' || user.status !== 'active')) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin', status: 'active' },
      });
    }

    // Return safe user object (without password)
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
