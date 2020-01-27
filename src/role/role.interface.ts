import { Document } from 'mongoose';
import { IPermission } from 'src/permission/permission.interface';

export interface IRole extends Document {
  name: String;
  slug: String;
  description: String;
  permissions: IPermission[];
  createdAt: Date;
  updatedAt: Date;
}
