import { IUser } from '@modules/user/user.interface';
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
  photo: string;
  date: Date;
}

export interface IBabyHeight {
  height: number;
  date: Date;
}

export interface IBabyWeight {
  weight: number;
  date: Date;
}

export interface IBabyImmunization {
  immunization: string;
  date: Date;
}
export interface IBaby extends Document {
  name: string;
  dob: Date;
  sex: ESex;
  parent: IUser | string;
  photos: IBabyPhoto[];
  heights: IBabyHeight[];
  weights: IBabyWeight[];
  immunizations: IBabyImmunization[];
  createdAt: Date;
  updatedAt: Date;
}
