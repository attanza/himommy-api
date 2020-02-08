import { isUnique } from '@modules/helpers';
import { IRole } from '@modules/role/role.interface';
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
import { v4 } from 'uuid';
import mail from '../helpers/mail';
import { Redis } from '../helpers/redis';
import { IUser } from '../user/user.interface';
import { RegisterDto } from './auth.dto';
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
    @InjectModel('Role') private roleModel: Model<IRole>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
    role: string = 'mommy',
  ): Promise<string> {
    // Find role id
    const roleId = await this.roleModel.findOne({ slug: role }).select('_id');

    // Create User
    const { email, phone } = registerDto;
    await isUnique(this.userModel, 'email', email);
    await isUnique(this.userModel, 'phone', phone);
    const userData = { ...registerDto, role: roleId._id };
    const user = await this.userModel.create(userData);

    // Generate confirmation link
    const confirmationToken = v4();

    await Redis.set(confirmationToken, user._id, 60 * 60 * 24); // expires in one day
    // send verification mail
    const confirmationLink = `${
      process.env.APP_URL
    }/api/confirm/${confirmationToken}`;

    mail.sendMail(user.email, 'Account Activation', 'confirmEmail', {
      confirmationLink,
    });
    return confirmationToken;
  }

  async confirm(token): Promise<void> {
    if (!token || token === '') {
      throw new BadRequestException('Invalid token');
    }

    const userId = await Redis.get(token);
    if (!userId || userId == null) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = true;

    Promise.all([user.save(), Redis.del(token)]);
  }

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

  async generateToken(user: IUser) {
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
