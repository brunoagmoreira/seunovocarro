import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  vehicle_id!: string;

  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  utm_source?: string;

  @IsString()
  @IsOptional()
  utm_medium?: string;

  @IsString()
  @IsOptional()
  utm_campaign?: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}
