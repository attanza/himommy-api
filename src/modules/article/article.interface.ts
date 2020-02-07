import { Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  subtile: string;
  content: string;
  age: number;
  image: string;
  category: IArticleCategory;
  description: string;
  isPublish: boolean;
  isAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum IArticleCategory {
  ARTICLES = 'ARTICLES',
  MYTHS = 'MYTHS',
  TIPS = 'TIPS',
}
