import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateImmunizationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdateImmunizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  description: string;
}
