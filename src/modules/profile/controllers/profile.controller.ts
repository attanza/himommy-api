import avatarInterceptor from '@/modules/helpers/avatarInterceptor';
import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { UpdateUserDto } from '@/modules/user/user.dto';
import { IUser } from '@/modules/user/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { apiUpdated } from '../../helpers/responseParser';
import { ChangePasswordDto, ProfileUpdateDto } from '../profile.dto';
import { ProfileService } from '../profile.service';

@Controller('admin/profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  modelName = 'Profile';

  constructor(private profileService: ProfileService) {}

  @Post('change-password')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  async changePassword(
    @GetUser() user: IUser,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<IApiItem> {
    await this.profileService.changePassword(user, changePasswordDto);
    return apiUpdated('Password', null);
  }

  @Post('avatar-upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('avatar', avatarInterceptor))
  async uploadFile(@GetUser() user: IUser, @UploadedFile() avatar) {
    if (!avatar) {
      throw new BadRequestException(
        'Avatar should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }

    const updated = await this.profileService.saveAvatar(avatar, user._id);
    return apiUpdated('Profile Updated', updated);
  }

  @Put('')
  @UsePipes(ValidationPipe)
  async update(
    @GetUser() user: IUser,
    @Body() updateDto: ProfileUpdateDto
  ): Promise<IApiItem> {
    const userKeys = ['firstName', 'lastName', 'email', 'phone'];
    const userData: UpdateUserDto = {};
    userKeys.map(key => {
      if (updateDto[key]) {
        userData[key] = updateDto[key];
      }
    });
    const updated = await this.profileService.updateUser(user._id, userData);
    return apiUpdated('Profile', updated);
  }
}
