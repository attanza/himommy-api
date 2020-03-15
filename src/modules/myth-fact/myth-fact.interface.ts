import { Document } from 'mongoose';

export interface IMythFact extends Document {
  title: string;
  subtitle: string;
  description: string;
  myth: string;
  fact: string;
  image: string;
  isPublish: boolean;
  createdAt: Date;
  updatedAt: Date;
}
