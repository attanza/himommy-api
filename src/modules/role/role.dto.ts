import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: String;

  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
  })
  permissions?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: String;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: String;

  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
  })
  permissions?: string[];
}
