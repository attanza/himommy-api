import * as mongoose from 'mongoose';
export const MommyCheckListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    checkList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CheckList',
    },
  },
  { timestamps: true },
);

MommyCheckListSchema.index({ user: 1, checkList: 1 });
