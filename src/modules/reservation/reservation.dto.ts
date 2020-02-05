import {
  ArrayNotEmpty,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class TServiceDto {
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
