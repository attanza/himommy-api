import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import avatarInterceptor from '@/modules/helpers/avatarInterceptor';
import { UpdateMommyDto } from '@/modules/mommy-detail/dto/mommy-detail.dto';
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

@Controller('mobile/profile')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileProfileController {
  modelName = 'Profile';

  constructor(private profileService: ProfileService) {}
  @Post('change-password')
  @Role('mommy')
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
  @Role('mommy')
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
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async update(
    @GetUser() user: IUser,
    @Body() updateDto: ProfileUpdateDto
  ): Promise<IApiItem> {
    // User Basic Info
    const userKeys = ['firstName', 'lastName', 'email', 'phone'];
    let userData: UpdateUserDto = {};
    userKeys.map(key => {
      if (updateDto[key]) {
        userData = { ...userData, [key]: updateDto[key] };
      }
    });

    const updatedUser: IUser = await this.profileService.updateUser(
      user._id,
      userData
    );

    // Mommy Detail
    const mommyDetailKeys = [
      'dob',
      'height',
      'occupation',
      'education',
      'husbandName',
      'hpht',
    ];

    let detailData: Partial<UpdateMommyDto> = {};
    mommyDetailKeys.map(key => {
      if (updateDto[key]) {
        detailData = { ...detailData, [key]: updateDto[key] };
      }
    });
    detailData.user = user._id;
    // check lists
    if (updateDto.checkLists && updateDto.checkLists.length > 0) {
      await this.profileService.isCheckListsExists(updateDto.checkLists);
    }
    // questions
    if (updateDto.questions && updateDto.questions.length > 0) {
      await this.profileService.isQuestionsExists(updateDto.questions);
      const level = await this.profileService.getLevelFromIds(
        updateDto.questions
      );
      if (updateDto.questions.length > 6) {
        detailData.currentQuestionLevel = level;
      }
    }

    const updatedDetail = await this.profileService.updateDetail(detailData);

    return apiUpdated(this.modelName, {
      ...updatedUser.toJSON(),
      detail: updatedDetail,
    });
  }
}
