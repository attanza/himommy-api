import {
  ArrayNotEmpty,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EStatus } from '../reservation.interface';

export class TServiceDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  name: string;

  @IsNotEmpty()
  @IsInt()
  price: number;
}

export class CreateReservationDto {
  @IsNotEmpty()
  @IsMongoId()
  tocologist: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  services: TServiceDto[];

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note: string;
}

export class UpdateReservationDto {
  @ValidateNested({ each: true })
  services: TServiceDto[];

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsIn([EStatus.CANCEL, EStatus.COMPLETED])
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note: string;

  @IsOptional()
  @IsInt()
  rate: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  comment: string;
}
