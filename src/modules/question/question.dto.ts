import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TAnswerDto {
  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsBoolean()
  isCorrectAnswer: boolean;
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsInt()
  level: number;

  @ValidateNested({ each: true })
  answers: TAnswerDto;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question: string;

  @IsOptional()
  @IsInt()
  level: number;

  @ValidateNested({ each: true })
  answers: TAnswerDto;

  @IsOptional()
  @IsString()
  description: string;
}
