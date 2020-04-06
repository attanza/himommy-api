import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { EMommyBloodPressureStatus } from '../mommy-detail.enums';

export class CreateBloodPressureDto {
  @IsNotEmpty()
  @IsNumber()
  systolic: number;

  @IsNotEmpty()
  @IsNumber()
  diastolic: number;

  @IsNotEmpty()
  @IsIn([
    EMommyBloodPressureStatus.LOW,
    EMommyBloodPressureStatus.NORMAL,
    EMommyBloodPressureStatus.HYPERTENSION,
  ])
  status: EMommyBloodPressureStatus;
}
