import { generateImageLink } from '@modules/helpers/generateImageLink';
import * as mongoose from 'mongoose';
export const PregnancyAgesSchema = new mongoose.Schema(
  {
    week: Number,
    image: String,
    title: String,
    subtitle: String,
    description: String,
    content: String,
    isPublish: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
PregnancyAgesSchema.index({ title: 1, week: 1 });
PregnancyAgesSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
