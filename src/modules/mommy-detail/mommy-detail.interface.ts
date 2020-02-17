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
  createdAt: Date;
  updatedAt: Date;
}
