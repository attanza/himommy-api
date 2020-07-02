import { generateImageLink } from '@/modules/helpers/generateImageLink';
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
MythFactSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
