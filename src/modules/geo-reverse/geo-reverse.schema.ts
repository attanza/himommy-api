import * as mongoose from 'mongoose';
export const GeoReverseSchema = new mongoose.Schema(
  {
    lat: Number,
    lon: Number,
    displayName: String,
    address: {
      road: String,
      neighborhood: String,
      village: String,
      state: String,
      postcode: String,
      country: String,
      countryCode: String,
    },
  },
  { timestamps: true }
);

GeoReverseSchema.index({ lat: 1, lon: 1 });
