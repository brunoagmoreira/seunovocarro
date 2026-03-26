import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Transmission, FuelType, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year!: number;

  @IsNumber()
  @Min(0)
  mileage!: number;

  @IsEnum(Transmission)
  transmission!: Transmission;

  @IsEnum(FuelType)
  fuel!: FuelType;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  doors?: number;

  @IsString()
  @IsOptional()
  plate_ending?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  slug!: string;
}

export class UpdateVehicleDto extends CreateVehicleDto {
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}
