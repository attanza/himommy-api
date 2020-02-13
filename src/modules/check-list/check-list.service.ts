import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICheckList } from './check-list.interface';

@Injectable()
export class CheckListService extends DbService {
  constructor(@InjectModel('CheckList') private model: Model<ICheckList>) {
    super(model);
  }
}
