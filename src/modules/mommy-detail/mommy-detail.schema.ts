import * as moment from 'moment';
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
    checkLists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckList',
      },
    ],
  },
  { timestamps: true },
);

MommyDetailSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.hpht) {
    const from = moment();
    const to = moment(obj.hpht);
    const days = Math.abs(
      moment(from, 'YYYY-MM-DD')
        .startOf('day')
        .diff(moment(to, 'YYYY-MM-DD').startOf('day'), 'weeks'),
    );
    obj.pregnancyAge = days;
  }
  return obj;
};
