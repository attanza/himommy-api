import { TocologistService } from '@modules/tocologist/tocologist.service';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { apiItem } from '../helpers/responseParser';
import { LoginDto, LoginOutput, RefreshTokenDto } from './auth.interface';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';

@Controller('tocologist')
export class TocologistAuthController {
  constructor(
    private authService: AuthService,
    private tocologistService: TocologistService,
  ) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Res() res, @Body() loginDto: LoginDto): Promise<LoginOutput> {
    const allowedRoles = ['tocologist'];

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

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@GetUser() user: IUser) {
    return apiItem('User', this.parseUserTocologist(user));
  }

  private parseUserTocologist(user) {
    const userKeys = [
      '_id',
      'firstName',
      'lastName',
      'email',
      'phone',
      'avatar',
    ];
    const tocologistKeys = [
      '_id',
      'location',
      'holiday',
      'name',
      'email',
      'phone',
      'operationTime',
      'services',
    ];

    const userData = {};
    userKeys.map(key => {
      if (key === 'avatar') {
        userData[key] = process.env.APP_URL + user[key];
      } else {
        userData[key] = user[key];
      }
    });
    const tocologistData = {};
    tocologistKeys.map(key => {
      if (key === 'image') {
        tocologistData[key] = process.env.APP_URL + user.tocologist[key];
      } else {
        tocologistData[key] = user.tocologist[key];
      }
    });

    return { ...userData, tocologist: tocologistData };
  }
}
