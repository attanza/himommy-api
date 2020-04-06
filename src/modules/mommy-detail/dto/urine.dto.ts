import { IsIn, IsNotEmpty } from 'class-validator';
import { EMommyUrine } from '../mommy-detail.enums';

export class CreateUrineDto {
  @IsNotEmpty()
  @IsIn([
    EMommyUrine.NEGATIVE,
    EMommyUrine.POSITIVE_1,
    EMommyUrine.POSITIVE_2,
    EMommyUrine.POSITIVE_3,
    EMommyUrine.POSITIVE_4,
  ])
  urine: EMommyUrine;
}
