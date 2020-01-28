import { Document } from 'mongoose';

export interface IUser extends Document {
  name: IName;
  email: String;
  phone: String;
  createdAt: Date;
  updatedAt: Date;
}

interface IName {
  first: String;
  last: String;
}
