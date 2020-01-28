import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { IUser } from '../user/user.interface';
import { JwtPayload, LoginDto, LoginOutput } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginOutput> {
    const { uid, password } = loginDto;
    const user = await this.userModel.findOne({
      $or: [{ email: uid }, { phone: uid }],
    });

    if (!user) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }

    const tokenPayload: JwtPayload = { uid: user._id };
    const token = await this.jwtService.sign(tokenPayload);

    const refreshTokenPayload: JwtPayload = { uid: user.refreshToken };
    const refreshToken = await this.jwtService.sign(refreshTokenPayload);

    return {
      meta: {
        status: 200,
        message: 'Login Succeed',
      },
      data: { token, refreshToken },
    };
  }
}
