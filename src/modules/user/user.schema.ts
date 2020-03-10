import { generateImageLink } from '@modules/helpers/generateImageLink';
import { hash } from 'bcrypt';
import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import { IUser } from './user.interface';
export const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
    },
    phone: String,
    password: String,
    refreshToken: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    authProvider: String,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    avatar: String,
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 });

UserSchema.pre<IUser>('save', async function(next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await hash(this.password, 12);
    this.password = hashed;
    return next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.pre<IUser>('save', async function(next: mongoose.HookNextFunction) {
  try {
    this.refreshToken = uuid();
    return next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  if (obj.avatar && obj.avatar !== '') {
    obj.avatar = generateImageLink(obj.avatar);
  }
  return obj;
};
