import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ESex } from '../baby.interface';

export class CreateBabyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: Date;

  @IsNotEmpty()
  @IsIn([ESex.MALE, ESex.FEMALE])
  sex: string;

  @IsNotEmpty()
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
}
