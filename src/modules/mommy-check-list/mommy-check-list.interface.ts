import { ICheckList } from '@modules/check-list/check-list.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface IMommyCheckList extends Document {
  user: IUser;
  checkList: ICheckList;
  createdAt: Date;
  updatedAt: Date;
}
