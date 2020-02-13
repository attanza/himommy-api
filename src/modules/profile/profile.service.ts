import { UpdateMommyDto } from '@modules/mommy-detail/mommy-detail.dto';
import { MommyDetailService } from '@modules/mommy-detail/mommy-detail.service';
import { UpdateTocologistDto } from '@modules/tocologist/tocologist.dto';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
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
    private tocologistService: TocologistService,
  ) {}
  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(user, changePasswordDto);
  }

  async saveAvatar(avatar: any, user: IUser) {
    return await this.userService.saveAvatar(avatar, user);
  }

  async updateUser(id: string, updateDto: UpdateUserDto) {
    if (updateDto.email) {
      this.userService.isUnique('email', updateDto.email, id);
    }
    if (updateDto.phone) {
      this.userService.isUnique('phone', updateDto.phone, id);
    }
    await this.userService.dbUpdate('User', id, updateDto);
    return this.userService.findByIdWithRolePermissions(id);
  }

  async updateDetail(updateDto: UpdateMommyDto) {
    return await this.mommyService.createOrUpdateDetail(updateDto);
  }

  async updateTocologistDetail(
    id: string,
    updateDto: UpdateTocologistDto,
  ): Promise<ITocologist> {
    await this.tocologistService.dbUpdate('Tocologist', id, updateDto);
    return await this.tocologistService.getById({ id });
  }
}
