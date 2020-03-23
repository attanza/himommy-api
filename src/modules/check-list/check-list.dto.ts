import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ECheckListCategory } from './check-list.interface';

export class CreateCheckListDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  item: string;

  @IsNotEmpty()
  @IsIn([
    ECheckListCategory.HEALTH,
    ECheckListCategory.LABORATORY,
    ECheckListCategory.NUTRITION,
    ECheckListCategory.PREGNANCY_PREPARATION,
    ECheckListCategory.PREGNANCY_SIGNS,
  ])
  category: string;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}

export class UpdateCheckListDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  item: string;

  @IsOptional()
  @IsIn([
    ECheckListCategory.HEALTH,
    ECheckListCategory.LABORATORY,
    ECheckListCategory.NUTRITION,
    ECheckListCategory.PREGNANCY_PREPARATION,
    ECheckListCategory.PREGNANCY_SIGNS,
  ])
  category: string;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}
