import * as mongoose from 'mongoose';
export const ReasonSchema = new mongoose.Schema(
  {
    category: String,
    reason: {
      type: String,
      unique: true,
    },
    description: String,
  },
  { timestamps: true },
);

ReasonSchema.index({ level: 1 });
