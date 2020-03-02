import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  content: string;
  isRead: boolean;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}
