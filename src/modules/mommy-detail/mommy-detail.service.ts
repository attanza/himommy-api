import { Redis } from '@modules/helpers/redis';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateMommyDto } from './mommy-detail.dto';
import { IMommyDetail } from './mommy-detail.interface';

@Injectable()
export class MommyDetailService extends DbService {
  constructor(@InjectModel('MommyDetail') private model: Model<IMommyDetail>) {
    super(model);
  }

  async createOrUpdateDetail(updateDto: Partial<UpdateMommyDto>) {
    const { user } = updateDto;
    let data;
    data = await this.model.findOne({ user });
    if (!data) {
      data = await this.model.create(updateDto);
    } else {
      Object.keys(updateDto).map(key => (data[key] = updateDto[key]));
      await data.save();
    }
    Redis.del(`User_${user}`);
    return data;
  }

  async getByUser(userId: string) {
    const redisKey = `MommyDetail_user_${userId}`;
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      return JSON.parse(cache);
    }
    const data = await this.model.findOne({ user: userId }).lean();
    Redis.set(redisKey, JSON.stringify(data));
    return data;
  }
}
