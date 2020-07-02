import { ICheckList } from '@/modules/check-list/check-list.interface';
import { IUser } from '@/modules/user/user.interface';
import { Document } from 'mongoose';

export enum ESex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum EBabyDetailData {
  photos = 'photos',
  weights = 'weights',
  heights = 'heights',
  immunizations = 'immunizations',
}

export interface IBabyPhoto {
  _id?: string;
  photo: string;
  date: Date;
}

export interface IBabyHeight {
  _id?: string;
  height: number;
  date: Date;
}

export interface IBabyWeight {
  _id?: string;
  weight: number;
  date: Date;
}

export interface IBabyImmunization {
  _id?: string;
  immunization: string;
  date: Date;
}
export interface IBaby extends Document {
  name: string;
  dob: Date;
  sex: ESex;
  parent: IUser | string;
  checkLists: ICheckList[] | string[];
  photos: IBabyPhoto[];
  heights: IBabyHeight[];
  weights: IBabyWeight[];
  immunizations: IBabyImmunization[];
  createdAt: Date;
  updatedAt: Date;
}
