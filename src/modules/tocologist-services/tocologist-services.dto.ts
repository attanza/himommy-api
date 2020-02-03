import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTocologistServiceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}

export class UpdateTocologistServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}
