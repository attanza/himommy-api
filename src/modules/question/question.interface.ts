import { Document } from 'mongoose';

export interface IQuestion extends Document {
  question: string;
  level: number;
  answers: IAnswer;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswer {
  answer: string;
  isCorrectAnswer: boolean;
}
