import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMythFactDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  myth: string;

  @IsNotEmpty()
  @IsString()
  fact: string;
}

export class UpdateMythFactDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  myth: string;

  @IsOptional()
  @IsString()
  fact: string;

  @IsOptional()
  @IsBoolean()
  isPublish: boolean;
}
