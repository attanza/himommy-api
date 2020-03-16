import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { DbService } from '@modules/shared/services/db.service';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IBaby } from './baby.interface';

@Injectable()
export class BabyService extends DbService {
  constructor(
    @InjectModel('Baby') private model: Model<IBaby>,
    private userService: UserService
  ) {
    super(model);
  }

  async saveImage(id: string, image: any): Promise<IBaby> {
    const imageString = image.path.split('public')[1];

    const found: IBaby = await this.getById({ id });
    if (!found) {
      fs.unlinkSync(image);
    } else {
      this.unlinkImage(id, 'image');
      found.image = imageString;
      Promise.all([
        resizeImage([image.path], 400),
        found.save(),
        Redis.deletePattern('Baby_'),
      ]);
    }
    return found;
  }

  async checkUser(userId: string): Promise<void> {
    const user: IUser = await this.userService.getByKey('_id', userId);
    if (!user) {
      throw new BadRequestException('parent not exists');
    }
  }
}
