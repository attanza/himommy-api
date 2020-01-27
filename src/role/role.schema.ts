import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
export const RoleSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
  },
  { timestamps: true },
);

RoleSchema.pre('save', function(next: mongoose.HookNextFunction) {
  try {
    this['slug'] = paramCase(this['name']);
    return next();
  } catch (e) {
    return next(e);
  }
});
