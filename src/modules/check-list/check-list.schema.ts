import * as mongoose from 'mongoose';
export const CheckListSchema = new mongoose.Schema(
  {
    category: String,
    item: String,
    description: String,
  },
  { timestamps: true },
);

CheckListSchema.index({ category: 1 });
