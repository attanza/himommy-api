import { Document } from 'mongoose';

export interface IGeoReverseAddress {
  road: string;
  neighborhood: string;
  village: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
}

export interface IGeoReverse extends Document {
  lat: number;
  lon: number;
  displayName: string;
  address: IGeoReverseAddress;
  createdAt?: Date;
  updatedAt?: Date;
}
