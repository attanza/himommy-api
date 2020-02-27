import { Document } from 'mongoose';

export interface IReason extends Document {
  category: EReasonCategory;
  reason: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EReasonCategory {
  ORDER_REJECT = 'ORDER_REJECT',
  ORDER_CANCEL = 'ORDER_CANCEL',
}
