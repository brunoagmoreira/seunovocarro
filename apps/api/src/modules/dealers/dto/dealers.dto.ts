import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDealerDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class UpdateDealerDto extends CreateDealerDto {
  @IsBoolean()
  @IsOptional()
  verified?: boolean;
}
