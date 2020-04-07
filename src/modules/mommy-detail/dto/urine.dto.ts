import { IsIn, IsNotEmpty } from 'class-validator';
import { EMommyUrineStatus } from '../mommy-detail.enums';

export class CreateUrineDto {
  @IsNotEmpty()
  @IsIn([
    EMommyUrineStatus.NEGATIVE,
    EMommyUrineStatus.POSITIVE_1,
    EMommyUrineStatus.POSITIVE_2,
    EMommyUrineStatus.POSITIVE_3,
    EMommyUrineStatus.POSITIVE_4,
  ])
  urine: EMommyUrineStatus;
}
