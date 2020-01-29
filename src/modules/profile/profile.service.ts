import MqttHandler from '@modules/helpers/mqttHandler';
import resizeImage from '@modules/helpers/resizeImage';
import { IUser } from '@modules/user/user.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { ChangePasswordDto } from './profile.dto';
@Injectable()
export class ProfileService {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

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
    MqttHandler.sendMessage(
      `profile/avatar/${user._id}`,
      `${process.env.APP_URL}${user.avatar}`,
    );
  }
}
