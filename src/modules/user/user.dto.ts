import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class Name {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  first: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  last: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @ValidateNested()
  name: Name;

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

  @IsOptional()
  @IsMongoId()
  role: string;
}

export class UpdateUserDto {
  @IsOptional()
  @ValidateNested()
  name: Name;

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

  @IsOptional()
  @IsMongoId()
  role: string;
}
