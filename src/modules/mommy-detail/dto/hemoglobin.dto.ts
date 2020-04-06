import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import {
  EMommyHemoglobinStatus,
  EMommyHemoglobinTrimester,
} from '../mommy-detail.enums';
export class CreateHemoglobinDto {
  @IsNotEmpty()
  @IsNumber()
  hemoglobin: number;

  @IsNotEmpty()
  @IsIn([
    EMommyHemoglobinTrimester.TRIMESTER_1,
    EMommyHemoglobinTrimester.TRIMESTER_2,
    EMommyHemoglobinTrimester.TRIMESTER_3,
  ])
  trimester: EMommyHemoglobinTrimester;

  @IsNotEmpty()
  @IsIn([
    EMommyHemoglobinStatus.LOW,
    EMommyHemoglobinStatus.NORMAL,
    EMommyHemoglobinStatus.MEDIUM,
    EMommyHemoglobinStatus.HEAVY,
  ])
  status: EMommyHemoglobinStatus;
}
