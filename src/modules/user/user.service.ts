import mqttHandler from '@modules/helpers/mqttHandler';
import resizeImage from '@modules/helpers/resizeImage';
import { ChangePasswordDto } from '@modules/profile/profile.dto';
import { DbService } from '@modules/shared/db.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { IRole } from '../role/role.interface';
import { IUser } from './user.interface';

@Injectable()
export class UserService extends DbService {
  constructor(
    @InjectModel('User') private model: Model<IUser>,
    @InjectModel('Role') private roleModel: Model<IRole>,
  ) {
    super(model);
  }

  async checkRole(roleId: string): Promise<void> {
    if (roleId && roleId !== '') {
      const found = await this.roleModel.findById(roleId);
      if (!found) {
        throw new HttpException(
          `roleId not existed in database`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async changePassword(
    user: IUser,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const { oldPassword, password } = changePasswordDto;
    const isMatched = await compare(oldPassword, user.password);
    if (!isMatched) {
      throw new BadRequestException('Old password incorrect');
    }
    user.password = password;
    await user.save();
    return 'Password successfully updated';
  }

  async saveAvatar(avatar: any, user: IUser): Promise<void> {
    user.avatar = avatar.path.split('public')[1];
    Promise.all([user.save(), resizeImage([avatar.path], 400)]);
    mqttHandler.sendMessage(
      `profile/avatar/${user._id}`,
      `${process.env.APP_URL}${user.avatar}`,
    );
  }
}
