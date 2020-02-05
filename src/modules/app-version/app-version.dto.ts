import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EPlatform } from './app-version.interface';
export class CreateAppVersionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([
    EPlatform.ANDROID_MOMMY,
    EPlatform.ANDROID_TOCOLOGIST,
    EPlatform.IOS_MOMMY,
    EPlatform.IOS_TOCOLOGIST,
    EPlatform.DASHBOARD,
  ])
  platform: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  version: string;
}

export class UpdateAppVersionDto {
  @IsOptional()
  @IsString()
  @IsIn([
    EPlatform.ANDROID_MOMMY,
    EPlatform.ANDROID_TOCOLOGIST,
    EPlatform.IOS_MOMMY,
    EPlatform.IOS_TOCOLOGIST,
    EPlatform.DASHBOARD,
  ])
  platform: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  version: string;
}
