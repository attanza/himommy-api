import { Document } from 'mongoose';
import { IPermission } from '../permission/permission.interface';

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  permissions: IPermission[];
  createdAt: Date;
  updatedAt: Date;
}
