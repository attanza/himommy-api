import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMommyCheckList } from './mommy-check-list.interface';

@Injectable()
export class MommyCheckListService extends DbService {
  constructor(
    @InjectModel('MommyCheckList') private model: Model<IMommyCheckList>,
  ) {
    super(model);
  }

  async insertMany(userId: string, checkLists: string[]): Promise<any> {
    const checkListData = [];
    checkLists.map(checkList =>
      checkListData.push({
        user: userId,
        checkList,
      }),
    );
    await this.model.insertMany(checkListData);
    return this.model
      .find({ user: userId, checkList: { $in: checkLists } })
      .populate(['CheckList'])
      .lean();
  }
}
