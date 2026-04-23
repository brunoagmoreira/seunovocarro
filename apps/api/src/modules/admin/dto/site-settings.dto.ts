import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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
}
