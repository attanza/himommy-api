import { Redis } from '@modules/helpers/redis';
import { QueueService } from '@modules/queue/queue.service';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable, Logger } from '@nestjs/common';
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
    const article: IArticle = await this.getById({ id });
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + article.image;
    article.image = imageString;
    try {
      await Promise.all([
        article.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern(`Article_${id}`),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return article;
  }
}
