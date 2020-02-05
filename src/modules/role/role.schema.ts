import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
import { IRole } from './role.interface';
export const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: String,
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  { timestamps: true },
);

RoleSchema.pre<IRole>('save', function(next: mongoose.HookNextFunction) {
  try {
    if (this.isModified('name')) {
      this.slug = paramCase(this.name);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});
