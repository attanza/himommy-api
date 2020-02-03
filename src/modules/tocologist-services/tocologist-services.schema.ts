import * as mongoose from 'mongoose';
export const TocologistServiceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
  },
  { timestamps: true },
);
