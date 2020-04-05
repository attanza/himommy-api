import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWeightDto {
  @IsNotEmpty()
  @IsNumber()
  weight: number;
}
