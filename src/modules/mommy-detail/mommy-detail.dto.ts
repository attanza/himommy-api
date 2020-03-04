import {
  IsArray,
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

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
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

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  questions: string[];

  @IsOptional()
  @IsInt()
  currentQuestionLevel: number;
}
