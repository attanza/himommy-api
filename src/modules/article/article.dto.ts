import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

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
  @IsString()
  @MaxLength(30)
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
  @IsString()
  @MaxLength(30)
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublish: boolean;
}
