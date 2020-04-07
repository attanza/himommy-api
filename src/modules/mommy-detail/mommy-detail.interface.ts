import { ICheckList } from '@modules/check-list/check-list.interface';
import { IQuestion } from '@modules/question/question.interface';
import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';
import {
  EMommyBloodPressureStatus,
  EMommyHemoglobinStatus,
  EMommyHemoglobinTrimester,
  EMommyUrineStatus,
  EMommyWeightStatus,
} from './mommy-detail.enums';

export interface IMommyWeight {
  _id?: string;
  weight: number;
  bmi: number;
  status: EMommyWeightStatus;
  date: Date;
}

export interface IMommyBloodPressure {
  _id?: string;
  systolic: number;
  diastolic: number;
  status: EMommyBloodPressureStatus;
  date: Date;
}
export interface IMommyHemoglobin {
  _id?: string;
  hemoglobin: number;
  trimester: EMommyHemoglobinTrimester;
  status: EMommyHemoglobinStatus;
  date: Date;
}

export interface IMommyUrine {
  _id?: string;
  urine: EMommyUrineStatus;
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
