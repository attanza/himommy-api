import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}
