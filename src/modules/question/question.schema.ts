import * as mongoose from 'mongoose';
export const QuestionSchema = new mongoose.Schema(
  {
    question: String,
    level: Number,
    description: String,
    answers: [
      {
        _id: false,
        answer: String,
        isCorrectAnswer: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true },
);

QuestionSchema.index({ level: 1 });
