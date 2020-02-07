import { Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  subtile: string;
  content: string;
  age: number;
  image: string;
  category: string;
  isPublish: boolean;
  createdAt: Date;
  updatedAt: Date;
}
