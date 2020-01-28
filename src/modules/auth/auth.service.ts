import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { IUser } from '../user/user.interface';
import {
  JwtPayload,
  LoginDto,
  LoginOutput,
  RefreshTokenDto,
} from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
    allowedRoles: string[],
  ): Promise<LoginOutput> {
    const { uid, password } = loginDto;
    const user = await this.userModel
      .findOne({
        $or: [{ email: uid }, { phone: uid }],
      })
      .populate('role');

    if (!user) {
      this.throwError();
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      this.throwError();
    }

    if (!user.isActive) {
      this.throwError();
    }

    if (!allowedRoles.includes(user.role.slug)) {
      this.throwError();
    }
    const tokenData = await this.generateToken(user);

    return {
      meta: {
        status: 200,
        message: 'Login Succeed',
      },
      data: tokenData,
    };
  }

  async refreshToken(
    user: IUser,
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginOutput> {
    const { refreshToken } = refreshTokenDto;
    const { uid } = this.jwtService.verify(refreshToken);

    if (uid !== user.refreshToken) {
      throw new BadRequestException('Refresh token failed');
    }
    const tokenData = await this.generateToken(user);

    return {
      meta: {
        status: 200,
        message: 'Refresh Token Succeed',
      },
      data: tokenData,
    };
  }

  private async generateToken(user: IUser) {
    const tokenPayload: JwtPayload = { uid: user._id };
    const token = await this.jwtService.sign(tokenPayload);
    const refreshTokenPayload: JwtPayload = { uid: user.refreshToken };
    const refreshToken = await this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });

    return { token, refreshToken };
  }

  private throwError() {
    throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
  }
}
