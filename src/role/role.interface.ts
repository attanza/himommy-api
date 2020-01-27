import { Document } from 'mongoose';

export interface IRole extends Document {
  name: String;
  slug: String;
  description: String;
  createdAt: Date;
  updatedAt: Date;
}
