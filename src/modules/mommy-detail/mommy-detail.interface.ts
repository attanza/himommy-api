import { ICheckList } from '@modules/check-list/check-list.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface IMommyDetail extends Document {
  user: IUser;
  dob: Date;
  height: number;
  weight: number;
  occupation: string;
  education: string;
  husbandName: string;
  hpht: Date;
  checkLists: ICheckList[];
  createdAt: Date;
  updatedAt: Date;
}
