import * as mongoose from 'mongoose';
export const ReservationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    tocologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tocologist',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    services: [
      {
        _id: false,
        name: String,
        price: Number,
      },
    ],
    date: Date,
    status: {
      type: String,
      default: 'NEW',
    },
    reason: String,
    note: String,
    rate: Number,
    comment: String,
    completedAt: Date,
  },
  { timestamps: true },
);
