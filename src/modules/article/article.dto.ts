import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EArticleCategory } from './article.interface';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsIn(Object.values(EArticleCategory))
  category: string;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsIn(Object.values(EArticleCategory))
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublish: boolean;

  @IsOptional()
  @IsBoolean()
  isAuth: boolean;
}
