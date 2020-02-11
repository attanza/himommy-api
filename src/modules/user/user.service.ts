import mqttHandler from '@modules/helpers/mqttHandler';
import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { ChangePasswordDto } from '@modules/profile/profile.dto';
import { RoleService } from '@modules/role/role.service';
import { DbService } from '@modules/shared/services/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { IUser } from './user.interface';

@Injectable()
export class UserService extends DbService {
  constructor(
    @InjectModel('User') private model: Model<IUser>,
    private roleService: RoleService,
  ) {
    super(model);
  }

  async findByUid(uid: string): Promise<IUser> {
    return await this.model
      .findOne({
        $or: [{ email: uid }, { phone: uid }],
      })
      .populate([
        {
          path: 'role',
          select: 'name slug',
          populate: { path: 'permissions', select: 'name slug' },
        },
      ]);
  }

  async findByIdWithRolePermissions(id: string): Promise<IUser> {
    return await this.model.findById(id).populate([
      {
        path: 'role',
        select: 'name slug',
        populate: { path: 'permissions', select: 'name slug' },
      },
    ]);
  }

  async checkRole(roleId: string): Promise<void> {
    if (roleId && roleId !== '') {
      await this.roleService.show({
        modelName: 'Role',
        id: roleId,
      });
    }
  }

  async changePassword(
    user: IUser,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const { oldPassword, password } = changePasswordDto;
    const userData = await this.model.findById(user._id);
    const isMatched = await compare(oldPassword, userData.password);
    if (!isMatched) {
      throw new BadRequestException('Old password incorrect');
    }
    userData.password = password;
    await userData.save();
    return 'Password successfully updated';
  }

  async saveAvatar(avatar: any, user: IUser): Promise<void> {
    const userData = await this.model.findById(user._id);
    userData.avatar = avatar.path.split('public')[1];
    Promise.all([
      userData.save(),
      resizeImage([avatar.path], 400),
      Redis.del(`User_${user._id}`),
    ]);
    mqttHandler.sendMessage(
      `profile/${user._id}/avatar`,
      `${process.env.APP_URL}${userData.avatar}`,
    );
  }
}
