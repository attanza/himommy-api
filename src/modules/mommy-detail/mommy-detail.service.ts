import { Redis } from '@modules/helpers/redis';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { UpdateMommyDto } from './dto/mommy-detail.dto';
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

  checkDuplicate(arrayToCheck: any[], dataToCheck: any) {
    const monthToCheck = moment(dataToCheck.date)
      .format('YYYY-M')
      .toString();
    const indexes: number[] = [];
    arrayToCheck.map((a, idx) => {
      const month = moment(a.date)
        .format('YYYY-M')
        .toString();
      if (month === monthToCheck) {
        indexes.push(idx);
      }
    });

    for (let i = indexes.length - 1; i >= 0; --i) {
      arrayToCheck.splice(i, 1);
    }
    return arrayToCheck;
  }

  getBmiAndStatus(weight: number, height: number) {
    const bmi = weight / Math.pow(height / 100, 2);
    let status = '';
    if (bmi < 17.0) {
      status = 'Sangat Kurus';
    } else if (bmi >= 17.0 && bmi <= 18.4) {
      status = 'Kurus';
    } else if (bmi >= 18.5 && bmi <= 25.0) {
      status = 'Normal';
    } else if (bmi >= 25.1 && bmi <= 27.0) {
      status = 'Gemuk';
    } else if (bmi > 27.0) {
      status = 'Sangat Gemuk';
    } else {
      status = 'Unknown';
    }

    return { bmi, status };
  }
}
