import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateBlogCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens.',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Cor deve ser um hexadecimal no formato #RRGGBB.',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
