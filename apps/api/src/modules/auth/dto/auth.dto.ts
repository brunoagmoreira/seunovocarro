import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;

  @ApiProperty({ example: 'senhaSegura1', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ maxLength: 2 })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'UF deve ter no máximo 2 caracteres' })
  state?: string;

  @ApiPropertyOptional({ enum: ['user', 'editor'] })
  @IsString()
  @IsOptional()
  @IsIn(['user', 'editor'], { message: 'Role inválida para cadastro público' })
  role?: 'user' | 'editor';

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_dealer?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dealer_name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;

  @ApiProperty({ example: '••••••••' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password!: string;
}

export class GoogleAuthDto {
  @ApiProperty({
    description: 'JWT `credential` retornado pelo Google Identity Services após o login no front.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Credencial Google ausente' })
  idToken!: string;
}
