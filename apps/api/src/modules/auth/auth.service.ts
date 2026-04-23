import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isSuperAdminEmail } from '../../common/auth/super-admin';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private buildSlug(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(registerDto.password, salt);
    const shouldBeSuperAdmin = isSuperAdminEmail(registerDto.email);
    const role = shouldBeSuperAdmin
      ? 'admin'
      : registerDto.role === 'editor'
        ? 'editor'
        : 'user';
    const status = shouldBeSuperAdmin ? 'active' : role === 'editor' ? 'pending' : 'active';

    const user = await this.usersService.create({
      email: registerDto.email,
      password_hash,
      full_name: registerDto.full_name?.trim(),
      phone: registerDto.phone?.trim(),
      city: registerDto.city?.trim(),
      state: registerDto.state?.trim().toUpperCase(),
      role,
      status,
    });

    if (registerDto.is_dealer && registerDto.dealer_name) {
      let baseSlug = this.buildSlug(registerDto.dealer_name);
      if (!baseSlug) {
        baseSlug = `loja-${user.id.slice(0, 8)}`;
      }

      let finalSlug = baseSlug;
      let suffix = 1;
      while (await this.prisma.dealer.findUnique({ where: { slug: finalSlug } })) {
        suffix += 1;
        finalSlug = `${baseSlug}-${suffix}`;
      }

      await this.prisma.dealer.create({
        data: {
          user_id: user.id,
          name: registerDto.dealer_name,
          slug: finalSlug,
        },
      });
    }

    const { password_hash: _, ...safeUser } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      message: 'Usuário registrado com sucesso',
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}
