import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export enum ESex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface IBaby extends Document {
  name: string;
  dob: Date;
  sex: ESex;
  parent: IUser | string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}
