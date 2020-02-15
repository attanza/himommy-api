import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQuestion } from './question.interface';

@Injectable()
export class QuestionService extends DbService {
  constructor(@InjectModel('Question') private model: Model<IQuestion>) {
    super(model);
  }
}
