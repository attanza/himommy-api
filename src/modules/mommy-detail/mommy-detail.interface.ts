import { ICheckList } from '@modules/check-list/check-list.interface';
import { IQuestion } from '@modules/question/question.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface IMommyWeight {
  _id?: string;
  weight: number;
  bmi: number;
  status: string;
  date: Date;
}

export interface IMommyBloodPressure {
  systolic: number;
  diastolic: number;
  status: string;
  date: Date;
}
export interface IMommyHemoglobin {
  hemoglobin: number;
  semester: number;
  status: string;
  date: Date;
}

export interface IMommyUrine {
  urine: string;
  status: string;
  date: Date;
}

export interface IMommyDetail extends Document {
  user: string | IUser;
  dob: Date;
  occupation: string;
  education: string;
  husbandName: string;
  hpht: Date;
  height: number;
  pregnancyAge: number;
  checkLists: ICheckList[];
  currentQuestionLevel: number;
  questions: IQuestion[];
  weights: IMommyWeight[];
  bloodPressures: IMommyBloodPressure[];
  hemoglobins: IMommyHemoglobin[];
  urines: IMommyUrine[];
  createdAt: Date;
  updatedAt: Date;
}
