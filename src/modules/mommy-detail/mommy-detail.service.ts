import { Redis } from '@modules/helpers/redis';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { UpdateMommyDto } from './dto/mommy-detail.dto';
import {
  EMommyBloodPressureStatus,
  EMommyWeightStatus,
  IMommyDetail,
} from './mommy-detail.interface';

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
    let status: EMommyWeightStatus;
    if (bmi < 17.0) {
      status = EMommyWeightStatus.VERY_UNDERWEIGHT;
    } else if (bmi >= 17.0 || bmi <= 18.4) {
      status = EMommyWeightStatus.UNDERWEIGHT;
    } else if (bmi >= 18.5 || bmi <= 25.0) {
      status = EMommyWeightStatus.NORMAL;
    } else if (bmi >= 25.1 || bmi <= 27.0) {
      status = EMommyWeightStatus.OVERWEIGHT;
    } else if (bmi > 27.0) {
      status = EMommyWeightStatus.OBESITY;
    } else {
      status = EMommyWeightStatus.UNKNOWN;
    }

    return { bmi, status };
  }

  getBloodPressureStatus(systolic: number, diastolic: number) {
    let status: EMommyBloodPressureStatus;
    const pressure = systolic / diastolic;
    const low = 90 / 60;
    const normalStart = 91 / 60;
    const normalEnd = 139 / 90;
    const high = 140 / 90;
    console.log({ pressure, low, normalStart, normalEnd, high });
    if (pressure <= 90 / 60) {
      status = EMommyBloodPressureStatus.LOW;
    } else if (pressure > 91 / 60 || pressure < 139 / 90) {
      status = EMommyBloodPressureStatus.NORMAL;
    } else if (pressure >= 140 / 90) {
      status = EMommyBloodPressureStatus.HYPERTENSION;
    } else {
      EMommyBloodPressureStatus.UNKNOWN;
    }
    return status;
  }
}
