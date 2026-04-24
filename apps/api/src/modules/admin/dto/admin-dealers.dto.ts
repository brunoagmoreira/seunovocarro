import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDealerDto {
  @ApiProperty({ description: 'E-mail de um usuário já cadastrado (será vinculado como dono da loja)' })
  @IsEmail({}, { message: 'E-mail inválido' })
  owner_email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'Nome da loja muito curto' })
  name!: string;

  @ApiPropertyOptional({ description: 'Slug da URL; se vazio, gera a partir do nome' })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateAdminDealerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebook?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
