import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
export const PermissionSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
  },
  { timestamps: true },
);

PermissionSchema.pre('save', function(next: mongoose.HookNextFunction) {
  try {
    this['slug'] = paramCase(this['name']);
    return next();
  } catch (e) {
    return next(e);
  }
});
