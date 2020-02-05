import { IUser } from '@modules/user/user.interface';
import { Document } from 'mongoose';

export interface ITocologist extends Document {
  name: string;
  email: string;
  phone: string;
  address: IAddress;
  location: ILocation;
  image: string;
  isActive: boolean;
  operationTime: IOperationTime;
  holiday: IHoliday[];
  services: ITServices[];
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  street: string;
  country: string;
  city: string;
  district: string;
  village: string;
  postCode: string;
}

export interface ILocation {
  type: string;
  coordinates: string[];
}

export interface IOperationTime {
  open: string;
  close: string;
}

export enum IHoliday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export interface ITServices {
  name: string;
  price: number;
  isAvailable?: boolean;
}
