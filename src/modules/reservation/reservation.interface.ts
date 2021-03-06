import { IUser } from '@/modules/user/user.interface';
import { Document } from 'mongoose';
import { ITocologist, ITServices } from '../tocologist/tocologist.interface';

export interface IReservation extends Document {
  code: string;
  tocologist: ITocologist | string;
  user: IUser | string;
  services: ITServices[];
  date: Date;
  status: EStatus;
  reason: string;
  note: string;
  rate: number;
  comment: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum EStatus {
  NEW = 'NEW',
  NEW_USER_UPDATE = 'NEW_USER_UPDATE',
  NEW_TOCOLOGIST_UPDATE = 'NEW_TOCOLOGIST_UPDATE',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCEL = 'CANCEL',
  COMPLETE_CONFIRM = 'COMPLETE_CONFIRM',
  COMPLETED = 'COMPLETED',
}
