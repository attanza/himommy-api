import * as mongoose from 'mongoose';
export const TocologistServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    description: String,
  },
  { timestamps: true },
);
