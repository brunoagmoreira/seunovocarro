import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, IsEnum } from 'class-validator';
import { BannerType } from '@prisma/client';

export class CreateBannerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsUrl()
  @IsOptional()
  image_url?: string;

  @IsUrl()
  @IsOptional()
  link_url?: string;

  @IsEnum(BannerType)
  @IsOptional()
  type?: BannerType;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
