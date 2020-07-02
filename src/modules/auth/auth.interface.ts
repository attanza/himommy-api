import { Meta2 } from '@/modules/shared/interfaces/response-parser.interface';
import { IsIn, IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsIn(['local', 'facebook', 'google'])
  provider: EProvider;
}

export enum EProvider {
  LOCAL = 'local',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export interface LoginOutput {
  meta: Meta2;
  data: LoginData;
}

export interface LoginData {
  token: string;
  refreshToken: string;
}

export interface JwtPayload {
  uid: string;
  tokenCount: number;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
