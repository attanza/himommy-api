import { GetUser } from '@modules/auth/get-user.decorator';
import avatarInterceptor from '@modules/helpers/avatarInterceptor';
import { apiSucceed, apiUpdated } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { IUser } from '@modules/user/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('avatar-upload')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('avatar', avatarInterceptor))
  uploadFile(@GetUser() user: IUser, @UploadedFile() avatar) {
    if (!avatar) throw new BadRequestException('Avatar upload failed');
    this.profileService.saveAvatar(avatar, user);
    return apiSucceed('Avatar Uploaded, actual result will be sent via socket');
  }
}
