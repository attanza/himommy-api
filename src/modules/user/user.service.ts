import mqttHandler from '@modules/helpers/mqttHandler';
import { Redis } from '@modules/helpers/redis';
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
import { compare, hash } from 'bcrypt';
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
    await this.model.updateOne(
      { _id: user._id },
      { password: await hash(password, 12) },
    );
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
