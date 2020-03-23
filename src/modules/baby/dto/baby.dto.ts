import {
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ESex } from '../baby.interface';

class BaseCreateBabyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: Date;

  @IsNotEmpty()
  @IsIn([ESex.MALE, ESex.FEMALE])
  sex: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}

export class CreateBabyDto extends BaseCreateBabyDto {
  @IsNotEmpty()
  @IsMongoId()
  parent: string;
}

export class MobileCreateBabyDto extends BaseCreateBabyDto {
  @IsOptional()
  @IsMongoId()
  parent: string;
}

export class UpdateBabyDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsIn([ESex.MALE, ESex.FEMALE])
  sex: string;

  @IsOptional()
  @IsMongoId()
  parent: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}
