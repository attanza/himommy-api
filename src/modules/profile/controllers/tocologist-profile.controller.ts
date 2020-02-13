import avatarInterceptor from '@modules/helpers/avatarInterceptor';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { UpdateTocologistDto } from '@modules/tocologist/tocologist.dto';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
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
import { apiSucceed, apiUpdated } from '../../helpers/responseParser';
import { ChangePasswordDto } from '../profile.dto';
import { ProfileService } from '../profile.service';

@Controller('tocologist/profile')
export class TocologistProfileController {
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
    if (!avatar) {
      throw new BadRequestException(
        'Avatar should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }

    this.profileService.saveAvatar(avatar, user);
    return apiSucceed('Avatar Uploaded, actual result will be sent via socket');
  }

  @Put('')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  async update(
    @GetUser() user: IUser,
    @Body() updateDto: UpdateUserDto,
  ): Promise<IApiItem> {
    // User Basic Info
    const userKeys = ['firstName', 'lastName', 'email', 'phone'];
    let userData = {};
    userKeys.map(key => {
      if (updateDto[key]) {
        userData = { ...userData, [key]: updateDto[key] };
      }
    });

    // Tocologist Detail
    // const tocologistDetailKeys = [
    //   'name',
    //   'email',
    //   'phone',
    //   'address',
    //   'location',
    //   'image',
    //   'isActive',
    //   'operationTime',
    //   'holiday',
    //   'services',
    // ];

    // let detailData = { user: user._id };
    // tocologistDetailKeys.map(key => {
    //   if (updateDto[key]) {
    //     detailData = { ...detailData, [key]: updateDto[key] };
    //   }
    // });

    const updatedUser: IUser = await this.profileService.updateUser(
      user._id,
      userData as UpdateUserDto,
    );

    let updatedTocologist: ITocologist;
    const detailData = {};

    if (user.tocologist) {
      updatedTocologist = await this.profileService.updateTocologistDetail(
        user.tocologist._id,
        detailData as UpdateTocologistDto,
      );
    }

    return apiUpdated(this.modelName, {
      ...updatedUser.toJSON(),
      tocologist: updatedTocologist,
    });
  }
}
