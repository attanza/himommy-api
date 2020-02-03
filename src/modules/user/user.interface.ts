import { Document } from 'mongoose';
import { IRole } from '../role/role.interface';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: IRole;
  password: string;
  refreshToken: string;
  isActive: boolean;
  authProvider: string;
  avatar: string;
  mommyDetail: MommyDetail;
  createdAt: Date;
  updatedAt: Date;
}

export interface MommyDetail {
  dob: Date;
  height: number;
  occupation: string;
  education: string;
  hpht: Date;
}
