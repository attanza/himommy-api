import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGeoReverseDto {
  @IsNotEmpty()
  @IsLatitude()
  lat: number;

  @IsNotEmpty()
  @IsLongitude()
  lon: number;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  road: string;

  @IsOptional()
  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsString()
  village: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  postcode: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  countryCode: string;
}

export class UpdateGeoReverseDto {
  @IsOptional()
  @IsLatitude()
  lat: number;

  @IsOptional()
  @IsLongitude()
  lon: number;

  @IsOptional()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  road: string;

  @IsOptional()
  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsString()
  village: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  postcode: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  countryCode: string;
}
