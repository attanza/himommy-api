import { UpdateMommyDto } from '@modules/mommy-detail/mommy-detail.dto';
import { MommyDetailService } from '@modules/mommy-detail/mommy-detail.service';
import { UpdateUserDto } from '@modules/user/user.dto';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './profile.dto';
@Injectable()
export class ProfileService {
  constructor(
    private userService: UserService,
    private mommyService: MommyDetailService,
  ) {}
  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(user, changePasswordDto);
  }

  async saveAvatar(avatar: any, user: IUser) {
    return await this.userService.saveAvatar(avatar, user);
  }

  async updateUser(id: string, updateDto: UpdateUserDto) {
    const uniques = ['phone', 'email'];
    const relations = ['role'];
    return await this.userService.update({
      modelName: 'User',
      id,
      updateDto,
      uniques,
      relations,
    });
  }

  async updateDetail(updateDto: UpdateMommyDto) {
    return await this.mommyService.createOrUpdateDetail(updateDto);
  }
}
