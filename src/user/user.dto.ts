import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: String;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: String;

  @IsNotEmpty()
  @IsEmail()
  email: String;

  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 128)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName: String;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: String;

  @IsNotEmpty()
  @IsEmail()
  email: String;

  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 128)
  password: string;
}
