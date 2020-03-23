import { CheckListService } from '@modules/check-list/check-list.service';
import { Redis } from '@modules/helpers/redis';
import { ImmunizationService } from '@modules/immunization/immunization.service';
import { QueueService } from '@modules/queue/queue.service';
import { DbService } from '@modules/shared/services/db.service';
import { IUser } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import * as fs from 'fs';
import * as moment from 'moment';
import { Model } from 'mongoose';
import {
  EBabyDetailData,
  IBaby,
  IBabyHeight,
  IBabyImmunization,
  IBabyPhoto,
  IBabyWeight,
} from './baby.interface';

@Injectable()
export class BabyService extends DbService {
  constructor(
    @InjectModel('Baby') private model: Model<IBaby>,
    private userService: UserService,
    private immunizationService: ImmunizationService,
    private queueService: QueueService,
    private checkListService: CheckListService
  ) {
    super(model);
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

  async checkDuplicate(arrayToCheck: any[], dataToCheck: any) {
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
      try {
        if (arrayToCheck[i].photo) {
          await fs.promises.unlink('public' + arrayToCheck[i].photo);
        }
      } catch (e) {
        Logger.debug(arrayToCheck[i].photo + 'not found');
      }
      arrayToCheck.splice(i, 1);
    }
    return arrayToCheck;
  }

  async isCheckListsExists(checkList: string[]): Promise<void> {
    await this.checkListService.isCheckListsExists(checkList);
  }

  async saveBabyDetail(request: Request, photo: any) {
    const { id, babyDetailData } = request.params;
    const data: IBaby = await this.getById({ id });

    if (!data) {
      await this.deletePhoto(photo);
      throw new BadRequestException('Baby not found');
    }

    // HEIGHT
    if (babyDetailData === EBabyDetailData.heights) {
      const heightData: IBabyHeight = {
        height: request.body.height,
        date: new Date(),
      };
      data.heights = await this.checkDuplicate(data.heights, heightData);
      data.heights.push(heightData);
      await this.deletePhoto(photo);
    }

    // WEIGHT
    if (babyDetailData === EBabyDetailData.weights) {
      const weightData: IBabyWeight = {
        weight: request.body.weight,
        date: new Date(),
      };
      data.weights = await this.checkDuplicate(data.weights, weightData);
      data.weights.push(weightData);
      await this.deletePhoto(photo);
    }

    // PHOTO
    if (babyDetailData === EBabyDetailData.photos) {
      if (!photo) {
        throw new BadRequestException('photo is required');
      }
      const imageString = photo.path.split('public')[1];
      await this.queueService.resizeImage(photo);

      // const imageString = this.saveImage(photo);
      const photoData: IBabyPhoto = {
        photo: imageString,
        date: new Date(),
      };
      data.photos = await this.checkDuplicate(data.photos, photoData);
      data.photos.push(photoData);
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
      data.immunizations = await this.checkDuplicate(
        data.immunizations,
        immunizationData
      );

      data.immunizations.push(immunizationData);
      await this.deletePhoto(photo);
    }
    await data.save();
    await Redis.del(`Baby_${id}`);
    return this.show({
      modelName: 'Baby',
      id,
    });
  }

  async updateBabyDetail(request: Request, photo: any) {
    const { id, babyDetailData } = request.params;
    const data: IBaby = await this.getById({ id });

    if (!data) {
      await this.deletePhoto(photo);
      throw new BadRequestException('Baby not found');
    }

    // HEIGHT
    if (babyDetailData === EBabyDetailData.heights) {
      const { heightId, height } = request.body;
      if (height && heightId) {
        const heightIndex = data.heights.findIndex(
          h => h._id.toString() === heightId
        );

        if (heightIndex === -1) {
          throw new BadRequestException('heightId not found');
        }

        data.heights[heightIndex].height = height;
        await this.deletePhoto(photo);
      }
    }

    // WEIGHT
    if (babyDetailData === EBabyDetailData.weights) {
      const { weightId, weight } = request.body;
      if (weight && weightId) {
        const weightIndex = data.weights.findIndex(
          w => w._id.toString() === weightId
        );

        if (weightIndex === -1) {
          throw new BadRequestException('weightId not found');
        }

        data.weights[weightIndex].weight = weight;
        await this.deletePhoto(photo);
      }
    }

    // PHOTO
    if (babyDetailData === EBabyDetailData.photos) {
      const { photoId } = request.body;
      if (photo && photoId) {
        const photoIndex = data.photos.findIndex(
          p => p._id.toString() === photoId
        );

        if (photoIndex === -1) {
          throw new BadRequestException('photoId not found');
        }

        if (!photo) {
          throw new BadRequestException('photo is required');
        }

        const imageString = photo.path.split('public')[1];
        const oldPhoto = data.photos[photoIndex].photo;
        console.log('oldPhoto', oldPhoto);
        data.photos[photoIndex].photo = imageString;
        try {
          await Promise.all([
            fs.promises.unlink('public' + oldPhoto),
            this.queueService.resizeImage(photo),
          ]);
        } catch (e) {
          Logger.debug(oldPhoto + ' not found');
        }
      }
    }

    // IMMUNIZATION

    if (babyDetailData === EBabyDetailData.immunizations) {
      const { immunizationId, immunization } = request.body;
      if (immunization && immunizationId) {
        const immunizationIndex = data.immunizations.findIndex(
          i => i._id.toString() === immunizationId
        );

        if (immunizationIndex === -1) {
          throw new BadRequestException('immunizationId not found');
        }

        const exists = await this.immunizationService.getById({
          id: immunization,
        });
        if (!exists) {
          throw new BadRequestException('immunization not exists');
        }

        data.immunizations[immunizationIndex].immunization = immunization;
        await this.deletePhoto(photo);
      }
    }
    await data.save();
    await Redis.del(`Baby_${id}`);
    return this.show({
      modelName: 'Baby',
      id,
    });
  }

  async deleteBabyDetail(request: Request) {
    const { id, babyDetailData } = request.params;
    const data: IBaby = await this.getById({ id });

    if (!data) {
      throw new BadRequestException('Baby not found');
    }

    // HEIGHT
    if (babyDetailData === EBabyDetailData.heights) {
      const { heightId } = request.body;
      if (heightId) {
        const heightIndex = data.heights.findIndex(
          h => h._id.toString() === heightId
        );

        if (heightIndex === -1) {
          throw new BadRequestException('heightId not found');
        }

        data.heights.splice(heightIndex, 1);
      }
    }

    // WEIGHT
    if (babyDetailData === EBabyDetailData.weights) {
      const { weightId } = request.body;
      if (weightId) {
        const weightIndex = data.weights.findIndex(
          w => w._id.toString() === weightId
        );

        if (weightIndex === -1) {
          throw new BadRequestException('weightId not found');
        }

        data.weights.splice(weightIndex, 1);
      }
    }

    // PHOTO
    if (babyDetailData === EBabyDetailData.photos) {
      const { photoId } = request.body;
      console.log('photoId', photoId);
      if (photoId) {
        const photoIndex = data.photos.findIndex(
          p => p._id.toString() === photoId
        );

        if (photoIndex === -1) {
          throw new BadRequestException('photoId not found');
        }

        const oldPhoto = data.photos[photoIndex].photo;
        data.photos.splice(photoIndex, 1);

        try {
          await fs.promises.unlink('public' + oldPhoto);
        } catch (e) {
          Logger.debug(oldPhoto + ' not found');
        }
      }
    }

    // IMMUNIZATION

    if (babyDetailData === EBabyDetailData.immunizations) {
      const { immunizationId } = request.body;
      if (immunizationId) {
        const immunizationIndex = data.immunizations.findIndex(
          i => i._id.toString() === immunizationId
        );

        if (immunizationIndex === -1) {
          throw new BadRequestException('immunizationId not found');
        }
        data.immunizations.splice(immunizationIndex, 1);
      }
    }
    await data.save();
    await Redis.del(`Baby_${id}`);
    return this.show({
      modelName: 'Baby',
      id,
    });
  }

  async deletePhoto(photo: any): Promise<void> {
    if (photo) {
      await fs.promises.unlink(photo.path);
    }
  }
}
