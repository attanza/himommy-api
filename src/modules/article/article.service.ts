import { DbService } from '@modules/shared/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IArticle } from './article.interface';

@Injectable()
export class ArticleService extends DbService {
  constructor(@InjectModel('Article') private model: Model<IArticle>) {
    super(model);
  }
}
