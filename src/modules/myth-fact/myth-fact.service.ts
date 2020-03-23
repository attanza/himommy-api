import { Redis } from '@modules/helpers/redis';
import { QueueService } from '@modules/queue/queue.service';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IMythFact } from './myth-fact.interface';

@Injectable()
export class MythFactService extends DbService {
  constructor(
    @InjectModel('MythFact') private model: Model<IMythFact>,
    private readonly queueService: QueueService
  ) {
    super(model);
  }

  /**
   * UPLOAD MythFact IMAGE
   * @param id
   * @param image
   */
  async saveImage(id: string, image: any): Promise<IMythFact> {
    const data: IMythFact = await this.getById({ id });
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
