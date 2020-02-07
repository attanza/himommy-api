import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TServiceDto } from './reservation.dto';
import { EStatus } from './reservation.interface';

export class UpdateTocologistReservationDto {
  @ValidateNested({ each: true })
  services: TServiceDto[];

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsIn([EStatus.REJECTED, EStatus.ACCEPTED, EStatus.COMPLETE_CONFIRM])
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note: string;
}
