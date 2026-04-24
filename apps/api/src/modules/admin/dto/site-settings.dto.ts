import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsInt, Min, Max } from 'class-validator';

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  gtm_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  ga_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  meta_pixel_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  google_oauth_client_id?: string | null;

  @ApiPropertyOptional({ description: 'Omitir para manter; string vazia remove o segredo armazenado.' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  google_oauth_client_secret?: string | null;

  @ApiPropertyOptional({ description: 'Segundos entre cada veículo em destaque no banner da home (3–120).' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(120)
  hero_featured_interval_seconds?: number;
}
