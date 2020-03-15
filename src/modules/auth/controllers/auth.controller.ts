import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { apiItem, apiSucceed } from '../../helpers/responseParser';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { LoginDto, LoginOutput, RefreshTokenDto } from '../auth.interface';
import { AuthService } from '../auth.service';

@Controller('admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<IApiItem> {
    const allowedRoles = ['super-administrator', 'administrator'];

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

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@GetUser() user: IUser) {
    return apiItem('User', user);
  }
}
