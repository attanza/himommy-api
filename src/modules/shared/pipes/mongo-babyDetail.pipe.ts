import { EBabyDetailData } from '@modules/baby/baby.interface';
import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';

export class BabyDetailDataPipe {
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsIn([
    EBabyDetailData.heights,
    EBabyDetailData.immunizations,
    EBabyDetailData.photos,
    EBabyDetailData.weights,
  ])
  babyDetailData: string;
}
