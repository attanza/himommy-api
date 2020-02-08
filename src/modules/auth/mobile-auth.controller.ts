import { Redis } from '@modules/helpers/redis';
import { apiItem, apiSucceed } from '@modules/helpers/responseParser';
import { MommyDetailService } from '@modules/mommy-detail/mommy-detail.service';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './auth.dto';
import { LoginDto, LoginOutput, RefreshTokenDto } from './auth.interface';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';

@Controller('mobile')
export class MobileAuthController {
  constructor(
    private authService: AuthService,
    private mommyDetailService: MommyDetailService,
    private userService: UserService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@GetUser() user: IUser) {
    const redisKey = `User_${user._id}`;
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      Logger.log(`User_${user._id} from cache`, 'DB SERVICE');
      return JSON.parse(cache);
    }
    const userData = await this.userService.getById({ id: user._id });
    const detail = await this.mommyDetailService.getByUserId(user._id);
    const output = apiItem('User', { ...userData.toJSON(), detail });
    await Redis.set(redisKey, JSON.stringify(output));
    return output;
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() registerDto: RegisterDto): Promise<IApiItem> {
    const confirmationLink = await this.authService.register(
      registerDto,
      'mommy',
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
  async login(@Res() res, @Body() loginDto: LoginDto): Promise<LoginOutput> {
    const allowedRoles = ['mommy'];

    const data = await this.authService.login(loginDto, allowedRoles);
    return res.status(200).send(data);
  }

  @Post('refreshToken')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async refreshToken(
    @Res() res,
    @GetUser() user: IUser,
    @Body() refreshTokenDto: RefreshTokenDto,
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
}
