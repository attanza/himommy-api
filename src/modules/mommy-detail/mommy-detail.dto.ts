import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateMommyDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsInt()
  height: number;

  @IsOptional()
  @IsInt()
  weight: number;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  occupation: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  education: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  husbandName: string;

  @IsOptional()
  @IsDateString()
  hpht: Date;
}

export class UpdateMommyDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsInt()
  height: number;

  @IsOptional()
  @IsInt()
  weight: number;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  occupation: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  education: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  husbandName: string;

  @IsOptional()
  @IsDateString()
  hpht: Date;
}
