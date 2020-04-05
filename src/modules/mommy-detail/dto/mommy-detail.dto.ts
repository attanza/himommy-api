import { IsArray, IsDateString, IsInt, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMommyDto {
  @IsOptional()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  occupation: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  education: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  husbandName: string;

  @IsOptional()
  @IsDateString()
  hpht: Date;

  @IsOptional()
  @IsInt()
  height: number;

  // pregnancyAge: number;


  @IsOptional()
  @IsArray()
  @IsMongoId({each: true})
  checkLists: string[];

  @IsOptional()
  currentQuestionLevel?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({each: true})
  questions: string[];
}
