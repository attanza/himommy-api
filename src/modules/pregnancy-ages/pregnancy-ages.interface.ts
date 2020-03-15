import { Document } from 'mongoose';

export interface IPregnancyAges extends Document {
  week: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  isPublish: boolean;
  createdAt: Date;
  updatedAt: Date;
}
