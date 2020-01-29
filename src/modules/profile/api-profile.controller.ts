import { GetUser } from '@modules/auth/get-user.decorator';
import { apiUpdated } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('api/profile')
export class ApiProfileController {
  constructor(private profileService: ProfileService) {}
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async changePassword(
    @GetUser() user: IUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<IApiItem> {
    await this.profileService.changePassword(user, changePasswordDto);
    return apiUpdated('Password', null);
  }
}
