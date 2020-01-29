import { hash } from 'bcrypt';
import * as mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
export const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
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
  { timestamps: true },
);

UserSchema.pre('save', async function(next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await hash(this['password'], 12);
    this['password'] = hashed;
    return next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.pre('save', async function(next: mongoose.HookNextFunction) {
  try {
    this['refreshToken'] = uuid();
    return next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  obj.avatar = 'http://localhost:2500/' + obj.avatar;
  return obj;
};
