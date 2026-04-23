import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'UF deve ter no máximo 2 caracteres' })
  state?: string;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'editor'], { message: 'Role inválida para cadastro público' })
  role?: 'user' | 'editor';

  @IsBoolean()
  @IsOptional()
  is_dealer?: boolean;

  @IsString()
  @IsOptional()
  dealer_name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password!: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Credencial Google ausente' })
  idToken!: string;
}
