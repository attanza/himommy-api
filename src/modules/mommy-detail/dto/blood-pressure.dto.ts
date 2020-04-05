import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBloodPressureDto {
  @IsNotEmpty()
  @IsNumber()
  systolic: number;

  @IsNotEmpty()
  @IsNumber()
  diastolic: number;
}
