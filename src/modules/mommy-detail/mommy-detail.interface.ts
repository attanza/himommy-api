import { ICheckList } from '@modules/check-list/check-list.interface';
import { IQuestion } from '@modules/question/question.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface IMommyDetail extends Document {
  user: string | IUser;
  dob: Date;
  occupation: string;
  education: string;
  husbandName: string;
  hpht: Date;
  pregnancyAge: number;
  checkLists: ICheckList[];
  currentQuestionLevel: number;
  questions: IQuestion[];
  healthTrack: IHealthTrack;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHealthTrack {
  height: number;
  weight: number;
}
