import { Redis } from '@modules/helpers/redis';
import { QueueService } from '@modules/queue/queue.service';
import { DbService } from '@modules/shared/services/db.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IPregnancyAges } from './pregnancy-ages.interface';

@Injectable()
export class PregnancyAgesService extends DbService {
  constructor(
    @InjectModel('PregnancyAges') private model: Model<IPregnancyAges>,
    private readonly queueService: QueueService
  ) {
    super(model);
  }

  /**
   * UPLOAD PREGNANCY AGES IMAGE
   * @param id
   * @param image
   */
  async saveImage(id: string, image: any): Promise<IPregnancyAges> {
    const data: IPregnancyAges = await this.getById({ id });
    if (!data) {
      await fs.promises.unlink(image.path);
      throw new BadRequestException('pregnancy age not found');
    }
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + data.image;
    data.image = imageString;
    try {
      await Promise.all([
        data.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern(`MythFact_${id}`),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return data;
  }
}
