import { GetUser } from '@modules/auth/get-user.decorator';
import avatarInterceptor from '@modules/helpers/avatarInterceptor';
import { UpdateMommyDto } from '@modules/mommy-detail/mommy-detail.dto';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { UpdateUserDto } from '@modules/user/user.dto';
import { IUser } from '@modules/user/user.interface';
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
import { apiSucceed, apiUpdated } from '../helpers/responseParser';
import { ChangePasswordDto, ProfileUpdateDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('api/profile')
export class ApiProfileController {
  modelName = 'Profile';

  constructor(private profileService: ProfileService) {}

  @Post('change-password')
  @HttpCode(200)
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
    if (!avatar)
      throw new BadRequestException(
        'Avatar should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    this.profileService.saveAvatar(avatar, user);
    return apiSucceed('Avatar Uploaded, actual result will be sent via socket');
  }

  @Put('')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async update(
    @GetUser() user: IUser,
    @Body() updateDto: ProfileUpdateDto,
  ): Promise<IApiItem> {
    // User Basic Info
    const userKeys = ['firstName', 'lastName', 'email', 'phone'];
    let userData = {};
    userKeys.map(key => {
      if (updateDto[key]) {
        userData = { ...userData, [key]: updateDto[key] };
      }
    });

    // Mommy Detail
    const mommyDetailKeys = [
      'dob',
      'height',
      'weight',
      'occupation',
      'education',
      'husbandName',
      'hpht',
    ];

    let detailData = { user: user._id };
    mommyDetailKeys.map(key => {
      if (updateDto[key]) {
        detailData = { ...detailData, [key]: updateDto[key] };
      }
    });

    const updatedUser = await this.profileService.updateUser(
      user._id,
      userData as UpdateUserDto,
    );

    const updatedDetail = await this.profileService.updateDetail(
      detailData as UpdateMommyDto,
    );

    return apiUpdated(this.modelName, {
      ...updatedUser.toJSON(),
      ...updatedDetail.toJSON(),
    });
  }
}
