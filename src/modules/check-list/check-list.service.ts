import { DbService } from '@/modules/shared/services/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICheckList } from './check-list.interface';

@Injectable()
export class CheckListService extends DbService {
  constructor(@InjectModel('CheckList') private model: Model<ICheckList>) {
    super(model);
  }

  async isCheckListsExists(checkLists: string[]): Promise<void> {
    if (checkLists && checkLists.length > 0) {
      const contFound = await this.model.countDocuments({
        _id: { $in: checkLists },
      });
      if (contFound !== checkLists.length) {
        throw new BadRequestException('One or more check lists is not exists');
      }
    }
  }
}
