import { Redis } from '@modules/helpers/redis';
import { ImmunizationService } from '@modules/immunization/immunization.service';
import { DbService } from '@modules/shared/services/db.service';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import * as moment from 'moment';
import { Model } from 'mongoose';
import {
  EBabyDetailData,
  IBaby,
  IBabyHeight,
  IBabyImmunization,
  IBabyWeight,
} from './baby.interface';
@Injectable()
export class BabyService extends DbService {
  constructor(
    @InjectModel('Baby') private model: Model<IBaby>,
    private userService: UserService,
    private immunizationService: ImmunizationService
  ) {
    super(model);
  }

  async saveImage(id: string, image: any): Promise<IBaby> {
    const imageString = image.path.split('public')[1];

    const found: IBaby = await this.getById({ id });
    // if (!found) {
    //   fs.unlinkSync(image);
    // } else {
    //   this.unlinkImage(id, 'image');
    //   found.image = imageString;
    //   Promise.all([
    //     resizeImage([image.path], 400),
    //     found.save(),
    //     Redis.deletePattern('Baby_'),
    //   ]);
    // }
    return found;
  }

  async checkUser(userId: string): Promise<void> {
    const user: IUser = await this.userService.getByKey('_id', userId);
    if (!user) {
      throw new BadRequestException('parent not exists');
    }
  }

  async checkIsMyBaby(id: string, parent: string): Promise<void> {
    const baby: IBaby = await this.getByKey('_id', id);
    if (baby) {
      if (typeof baby.parent === 'object') {
        if (baby.parent._id.toString() !== parent.toString()) {
          throw new ForbiddenException('Access is forbidden');
        }
      } else {
        if (baby.parent.toString() !== parent.toString()) {
          throw new ForbiddenException('Access is forbidden');
        }
      }
    }
  }

  checkDuplicate(arrayToCheck: any[], dataToCheck: any) {
    console.log('check duplicate');
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

  async saveBabyDetail(request: Request) {
    const { id, babyDetailData } = request.params;
    const data: IBaby = await this.getById({ id });

    if (!data) {
      throw new BadRequestException('Baby not found');
    }

    // HEIGHT
    if (babyDetailData === EBabyDetailData.heights) {
      const heightData: IBabyHeight = {
        height: request.body.height,
        date: new Date(),
      };
      data.heights = this.checkDuplicate(data.heights, heightData);
      data.heights.push(heightData);
    }

    // WEIGHT
    if (babyDetailData === EBabyDetailData.weights) {
      const wightData: IBabyWeight = {
        weight: request.body.weight,
        date: new Date(),
      };
      data.weights = this.checkDuplicate(data.weights, wightData);
      data.weights.push(wightData);
    }

    // IMMUNIZATION
    if (babyDetailData === EBabyDetailData.immunizations) {
      const exists = await this.immunizationService.getById({
        id: request.body.immunization,
      });
      if (!exists) {
        throw new BadRequestException('immunization not exists');
      }
      const immunizationData: IBabyImmunization = {
        immunization: request.body.immunization,
        date: new Date(),
      };
      data.immunizations.push(immunizationData);
    }
    await data.save();
    await Redis.del(`Baby_${id}`);
    return this.show({
      modelName: 'Baby',
      id,
    });
  }
}
