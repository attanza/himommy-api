import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  content: string;

  @IsNotEmpty()
  @IsMongoId()
  user: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  content: string;

  @IsOptional()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsBoolean()
  isRead: boolean;
}
