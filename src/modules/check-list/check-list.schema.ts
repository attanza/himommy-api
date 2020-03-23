import * as mongoose from 'mongoose';
export const CheckListSchema = new mongoose.Schema(
  {
    category: String,
    item: String,
    age: {
      type: Number,
      default: 0,
    },
    description: String,
  },
  { timestamps: true }
);

CheckListSchema.index({ category: 1 });
