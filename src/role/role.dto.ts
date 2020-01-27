import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description: String;
}
