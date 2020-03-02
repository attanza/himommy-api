import * as mongoose from 'mongoose';
export const NotificationSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);
