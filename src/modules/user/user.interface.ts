import { IMommyDetail } from '@modules/mommy-detail/mommy-detail.interface';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
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
  detail?: IMommyDetail;
  tocologist?: ITocologist;
  createdAt: Date;
  updatedAt: Date;
}
