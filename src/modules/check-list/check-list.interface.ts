import { Document } from 'mongoose';

export interface ICheckList extends Document {
  category: ECheckListCategory;
  item: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ECheckListCategory {
  LABORATORY = 'LABORATORY',
  NUTRITION = 'NUTRITION',
  HEALTH = 'HEALTH',
  PREGNANCY_PREPARATION = 'PREGNANCY_PREPARATION',
  PREGNANCY_SIGNS = 'PREGNANCY_SIGNS',
}
