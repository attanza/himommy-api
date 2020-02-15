import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 128)
  password: string;
}

export class ProfileUpdateDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsOptional()
  @IsMongoId()
  role: string;

  // Mommy Detail

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsInt()
  height: number;

  @IsOptional()
  @IsInt()
  weight: number;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  occupation: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  education: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  husbandName: string;

  @IsOptional()
  @IsDateString()
  hpht: Date;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}
