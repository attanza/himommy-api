import { ICheckList } from '@modules/check-list/check-list.interface';
import { IQuestion } from '@modules/question/question.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface IMommyDetail extends Document {
  user: string | IUser;
  dob: Date;
  height: number;
  weight: number;
  occupation: string;
  education: string;
  husbandName: string;
  hpht: Date;
  pregnancyAge: number;
  checkLists: ICheckList[];
  currentQuestionLevel: number;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
