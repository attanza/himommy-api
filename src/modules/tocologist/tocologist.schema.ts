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
    services: {
      name: String,
      price: Number,
      isAvailable: {
        type: Boolean,
        default: true,
      },
    },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

TocologistSchema.index({ location: '2dsphere' });
