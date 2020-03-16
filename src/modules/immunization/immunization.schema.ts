import * as mongoose from 'mongoose';
export const ImmunizationSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    description: String,
  },
  { timestamps: true }
);
ImmunizationSchema.index({ name: 1 });
