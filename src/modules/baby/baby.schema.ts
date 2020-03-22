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
    photos: [
      {
        photo: String,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    heights: [
      {
        height: Number,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    weights: [
      {
        weight: Number,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    immunizations: [
      {
        immunization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
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

  if (obj.photos && obj.photos.length > 0) {
    const photos = [...obj.photos];
    photos.map(p => (p.photo = generateImageLink(p.photo)));
    obj.photos = photos;
  }

  return obj;
};
