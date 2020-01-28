import { Document } from 'mongoose';
import { IRole } from '../role/role.interface';

export interface IUser extends Document {
  name: IName;
  email: string;
  phone: string;
  role: IRole;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IName {
  first: string;
  last: string;
}
