import { Document } from 'mongoose';

export interface ITocologistService extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
