import { generateImageLink } from '@/modules/helpers/generateImageLink';
import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
import { IArticle } from './article.interface';

export const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    subtitle: String,
    content: String,
    age: Number,
    image: String,
    category: String,
    description: String,
    isPublish: {
      type: Boolean,
      default: false,
    },
    isAuth: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ArticleSchema.index({ age: 1, category: 1, slug: 1 });

ArticleSchema.pre<IArticle>('save', function(next: mongoose.HookNextFunction) {
  try {
    if (this.isModified('title')) {
      this.slug = paramCase(this.title);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

ArticleSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
