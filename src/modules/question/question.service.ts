import { DbService } from '@modules/shared/services/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQuestion } from './question.interface';

@Injectable()
export class QuestionService extends DbService {
  constructor(@InjectModel('Question') private model: Model<IQuestion>) {
    super(model);
  }

  async isQuestionsExists(questions: string[]): Promise<void> {
    if (questions && questions.length > 0) {
      const contFound = await this.model.countDocuments({
        _id: { $in: questions },
      });
      if (contFound !== questions.length) {
        throw new BadRequestException('One or more questions is not exists');
      }
    }
  }

  async getLevelFromIds(ids: string[]): Promise<number> {
    const questions = await this.model
      .find({ _id: { $in: ids } })
      .select('level')
      .lean();
    const levels = [];
    if (questions && questions.length > 0) {
      questions.map(q => levels.push(q.level));
    }
    const distinct = [...new Set(levels)];
    if (distinct.length > 1) {
      throw new BadRequestException(
        'One or more question is not at the same level',
      );
    }
    return distinct[0];
  }
}
