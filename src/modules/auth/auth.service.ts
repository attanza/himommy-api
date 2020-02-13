import { IRole } from '@modules/role/role.interface';
import { RoleService } from '@modules/role/role.service';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { v4 } from 'uuid';
import mail from '../helpers/mail';
import { Redis } from '../helpers/redis';
import { IUser } from '../user/user.interface';
import { RegisterDto } from './auth.dto';
import {
  JwtPayload,
  LoginData,
  LoginDto,
  LoginOutput,
  RefreshTokenDto,
} from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private tocologistService: TocologistService,
  ) {}

  async register(
    registerDto: RegisterDto,
    role: string = 'mommy',
  ): Promise<string> {
    // Find role id
    const roleData: IRole = await this.roleService.getByKey('slug', role);
    if (!roleData) {
      throw new InternalServerErrorException('mommy role not found');
    }

    // Create User
    const { email, phone } = registerDto;
    await this.userService.isUnique('email', email);
    await this.userService.isUnique('phone', phone);
    const userData = { ...registerDto, role: roleData._id };
    const user = await this.userService.dbStore('User', userData);

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

    const user: IUser = await this.userService.getById({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = true;

    Promise.all([user.save(), Redis.del(token)]);
  }

  async tocologistLogin(loginDto: LoginDto): Promise<LoginData> {
    const { uid } = loginDto;
    const allowedRoles = ['tocologist'];
    const user = await this.userService.findByUid(uid);
    await this.checkUser(user, loginDto);
    if (!allowedRoles.includes(user.role.slug)) {
      Logger.log('Role not allowed', 'Auth');

      this.throwError();
    }
    const tocologist: ITocologist = await this.tocologistService.getByKey(
      'user',
      user._id,
    );
    if (!tocologist) {
      Logger.log('No Tocologist Attached', 'Auth');
      this.throwError();
    }
    return await this.generateToken(user);
  }

  async login(loginDto: LoginDto, allowedRoles: string[]): Promise<LoginData> {
    const { uid } = loginDto;
    const user = await this.userService.findByUid(uid);
    await this.checkUser(user, loginDto);
    if (!allowedRoles.includes(user.role.slug)) {
      Logger.log('Role not allowed', 'Auth');

      this.throwError();
    }
    return await this.generateToken(user);
  }

  private async checkUser(user: IUser, loginDto: LoginDto): Promise<void> {
    const { password } = loginDto;

    if (!user) {
      Logger.log('No User', 'Auth');
      this.throwError();
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      Logger.log('Invalid Password', 'Auth');

      this.throwError();
    }

    if (!user.isActive) {
      Logger.log('User not active', 'Auth');

      this.throwError();
    }
  }

  async refreshToken(
    user: IUser,
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginOutput> {
    const { refreshToken } = refreshTokenDto;
    const { uid } = this.jwtService.verify(refreshToken);
    const userData: IUser = await this.userService.getById({ id: user._id });
    if (uid !== userData.refreshToken) {
      throw new BadRequestException('Refresh token failed');
    }
    const tokenData = await this.generateToken(userData);

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
