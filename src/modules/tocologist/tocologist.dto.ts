import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IHoliday } from './tocologist.interface';

const allowedHoliday = [
  IHoliday.SUNDAY,
  IHoliday.MONDAY,
  IHoliday.TUESDAY,
  IHoliday.WEDNESDAY,
  IHoliday.THURSDAY,
  IHoliday.FRIDAY,
  IHoliday.SATURDAY,
];

export class CreateTocologistDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  district: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  village: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  postCode: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  open: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  close: string;

  @IsOptional()
  @IsArray()
  @IsIn(allowedHoliday, { each: true })
  holiday: IHoliday[];

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  user: string;
}

export class UpdateTocologistDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  district: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  village: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  postCode: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  open: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  close: string;

  @IsOptional()
  @IsIn(allowedHoliday, { each: true })
  holiday: IHoliday[];

  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  user: string;
}

export class AttachTocologistServicesDto {
  @IsArray()
  @ValidateNested()
  @Type(() => TServiceDto)
  services: TServiceDto[];
}

class TServiceDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  name: string;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;
}
