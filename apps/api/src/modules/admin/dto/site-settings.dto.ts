import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  gtm_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  ga_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  meta_pixel_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  google_oauth_client_id?: string | null;

  /** Omit to keep; empty string clears the stored secret. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  google_oauth_client_secret?: string | null;
}
