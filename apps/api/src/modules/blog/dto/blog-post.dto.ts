import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { BlogPostStatus } from '@prisma/client';

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MaxLength(500_000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  featured_image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  featured_image_alt?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsEnum(BlogPostStatus)
  status!: BlogPostStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  meta_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  meta_description?: string;

  /** Separadas por vírgula (ex.: `carro, dicas`). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  meta_keywords?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  reading_time_minutes?: number;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
