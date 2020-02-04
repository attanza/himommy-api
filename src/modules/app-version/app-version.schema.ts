import * as mongoose from 'mongoose';
export const AppVersionSchema = new mongoose.Schema(
  {
    platform: String,
    version: String,
  },
  { timestamps: true },
);

AppVersionSchema.index({ platform: 1 });
