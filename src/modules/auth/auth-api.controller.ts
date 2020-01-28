import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDto, LoginOutput } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthApiController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Res() res, @Body() loginDto: LoginDto): Promise<LoginOutput> {
    const allowedRoles = ['mommy', 'tocologist'];

    const data = await this.authService.login(loginDto, allowedRoles);
    return res.status(200).send(data);
  }
}
