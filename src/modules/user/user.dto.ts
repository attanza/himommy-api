import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 128)
  password: string;

  @IsOptional()
  @IsMongoId()
  role: string;
}

export class UpdateUserDto {
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
  role?: string;
}
