import { Redis } from '@modules/helpers/redis';
import { QueueService } from '@modules/queue/queue.service';
import { DbService } from '@modules/shared/services/db.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IArticle } from './article.interface';

@Injectable()
export class ArticleService extends DbService {
  constructor(
    @InjectModel('Article') private model: Model<IArticle>,
    private readonly queueService: QueueService
  ) {
    super(model);
  }

  async saveImage(image: any, id: string): Promise<IArticle> {
    const data: IArticle = await this.getById({ id });
    if (!data) {
      await fs.promises.unlink(image.path);
      throw new BadRequestException('article not found');
    }
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + data.image;
    data.image = imageString;
    try {
      await Promise.all([
        data.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern(`Article_${id}`),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return data;
  }
}
