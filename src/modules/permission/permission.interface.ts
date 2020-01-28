import { Document } from 'mongoose';

export interface IPermission extends Document {
  name: String;
  slug: String;
  description: String;
  createdAt: Date;
  updatedAt: Date;
}
