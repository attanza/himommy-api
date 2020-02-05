import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTocologistServiceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}

export class UpdateTocologistServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: string;
}
