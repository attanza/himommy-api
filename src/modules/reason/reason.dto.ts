import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EReasonCategory } from './reason.interface';

export class CreateReasonDto {
  @IsNotEmpty()
  @IsIn([EReasonCategory.ORDER_CANCEL, EReasonCategory.ORDER_REJECT])
  category: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}

export class UpdateReasonDto {
  @IsOptional()
  @IsIn([EReasonCategory.ORDER_CANCEL, EReasonCategory.ORDER_REJECT])
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}
