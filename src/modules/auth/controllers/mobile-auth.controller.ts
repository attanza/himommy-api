import { apiItem, apiSucceed } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { IUserFromSocialLogin } from '@modules/shared/interfaces/userFromSocialAuth.interface';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { RegisterDto } from '../auth.dto';
import { LoginDto, LoginOutput, RefreshTokenDto } from '../auth.interface';
import { AuthService } from '../auth.service';

@Controller('mobile')
export class MobileAuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@GetUser() user: IUser) {
    return apiItem('User', user);
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() registerDto: RegisterDto): Promise<IApiItem> {
    const confirmationLink = await this.authService.register(
      registerDto,
      'mommy'
    );
    return apiSucceed('Please confirm your email', confirmationLink);
  }

  @Get('/confirm/:token')
  async confirm(@Param('token') token: string) {
    await this.authService.confirm(token);
    return apiSucceed('User confirmation succeed');
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<IApiItem> {
    const allowedRoles = ['mommy'];

    const data = await this.authService.login(loginDto, allowedRoles);
    return apiSucceed('Login Succeed', data);
  }

  @Post('refreshToken')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async refreshToken(
    @Res() res,
    @GetUser() user: IUser,
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<LoginOutput> {
    const data = await this.authService.refreshToken(user, refreshTokenDto);
    return res.status(200).send(data);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook-token'))
  async getTokenAfterFacebookSignIn(@Req() req): Promise<LoginOutput> {
    const data = await this.authService.generateToken(req.user);
    return {
      meta: {
        status: 200,
        message: 'Login succeed',
      },
      data,
    };
  }

  @Get('google')
  async getTokenAfterGoogleSignIn(
    @Query('access_token') accessToken: string
  ): Promise<LoginOutput> {
    try {
      const resp = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(res => res.data);
      if (!resp.email) {
        throw new UnauthorizedException('Login failed');
      }
      const userData: IUserFromSocialLogin = {
        firstName: resp.given_name,
        lastName: resp.family_name,
        email: resp.email,
        avatar: resp.picture,
        password: resp.id,
        authProvider: 'google',
        isActive: true,
      };
      const user = await this.authService.getOrCreateUser(userData);
      const data = await this.authService.generateToken(user);
      return {
        meta: {
          status: 200,
          message: 'Login succeed',
        },
        data,
      };
    } catch (e) {
      throw new UnauthorizedException('Login failed');
    }
  }
}
