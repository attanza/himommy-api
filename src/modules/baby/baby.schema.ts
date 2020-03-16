import { generateImageLink } from '@modules/helpers/generateImageLink';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

export const BabySchema = new mongoose.Schema(
  {
    name: String,
    dob: Date,
    sex: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    image: String,
  },
  { timestamps: true }
);
BabySchema.index({ name: 1 });

BabySchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.dob) {
    const from = moment();
    const to = moment(obj.dob);
    const days = Math.abs(
      moment(from, 'YYYY-MM-DD')
        .startOf('day')
        .diff(moment(to, 'YYYY-MM-DD').startOf('day'), 'days')
    );
    obj.age = days;
  }

  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }

  return obj;
};
