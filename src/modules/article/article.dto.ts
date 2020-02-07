import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { IArticleCategory } from './article.interface';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subtile: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  @Max(40)
  age: number;

  @IsNotEmpty()
  @IsIn([
    IArticleCategory.ARTICLES,
    IArticleCategory.MYTHS,
    IArticleCategory.TIPS,
  ])
  category: string;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subtile: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  @Max(40)
  age: number;

  @IsOptional()
  @IsIn([
    IArticleCategory.ARTICLES,
    IArticleCategory.MYTHS,
    IArticleCategory.TIPS,
  ])
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublish: boolean;

  @IsOptional()
  @IsBoolean()
  isAuth: boolean;
}
