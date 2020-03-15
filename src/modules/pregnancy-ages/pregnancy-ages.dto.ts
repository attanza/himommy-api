import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePregnancyAgesDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(50)
  week: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subtitle: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdatePregnancyAgesDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  week: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subtitle: string;

  @IsOptional()
  @IsString()
  description: string;
}
