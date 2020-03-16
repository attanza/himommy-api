import { Document } from 'mongoose';

export interface IImmunization extends Document {
  name: string;
  age: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
