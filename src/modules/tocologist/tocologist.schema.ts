import { generateImageLink } from '@modules/helpers/generateImageLink';
import * as mongoose from 'mongoose';
export const TocologistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    address: {
      street: String,
      country: String,
      city: String,
      district: String,
      village: String,
      postCode: String,
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [],
    },
    image: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    operationTime: {
      open: String,
      close: String,
    },
    holiday: [Number],
    services: [
      {
        _id: false,
        name: String,
        price: Number,
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ratting: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

TocologistSchema.index({ location: '2dsphere' });

TocologistSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
