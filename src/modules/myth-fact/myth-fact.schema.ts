import * as mongoose from 'mongoose';
export const MythFactSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    description: String,
    myth: String,
    fact: String,
    image: String,
    isPublish: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
MythFactSchema.index({ title: 1 });
