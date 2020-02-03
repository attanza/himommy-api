import { Document } from 'mongoose';

export interface IAppVersion extends Document {
  platform: EPlatform;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EPlatform {
  ANDROID_MOMMY = 'android-mommy-app',
  IOS_MOMMY = 'ios-mommy-app',
  ANDROID_TOCOLOGIST = 'android-tocologist-app',
  IOS_TOCOLOGIST = 'ios-tocologist-app',
  DASHBOARD = 'dashboard',
}
