import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty()
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ enum: ['user', 'editor', 'admin'] })
  @IsOptional()
  @IsIn(['user', 'editor', 'admin'])
  role?: 'user' | 'editor' | 'admin';

  @ApiPropertyOptional({ enum: ['pending', 'active', 'suspended'] })
  @IsOptional()
  @IsIn(['pending', 'active', 'suspended'])
  status?: 'pending' | 'active' | 'suspended';
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string;

  @ApiPropertyOptional({ minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ enum: ['user', 'editor', 'admin'] })
  @IsOptional()
  @IsIn(['user', 'editor', 'admin'])
  role?: 'user' | 'editor' | 'admin';

  @ApiPropertyOptional({ enum: ['pending', 'active', 'suspended'] })
  @IsOptional()
  @IsIn(['pending', 'active', 'suspended'])
  status?: 'pending' | 'active' | 'suspended';
}
