import * as mongoose from 'mongoose';

export const MommyDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dob: Date,
    height: Number,
    weight: Number,
    occupation: String,
    education: String,
    husbandName: String,
    hpht: Date,
  },
  { timestamps: true },
);
