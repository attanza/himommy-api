import * as moment from 'moment';
import * as mongoose from 'mongoose';
export const MommyDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dob: Date,
    occupation: String,
    education: String,
    husbandName: String,
    hpht: Date,
    height: Number,
    checkLists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckList',
      },
    ],
    currentQuestionLevel: {
      type: Number,
      default: 0,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    weights: [
      {
        weight: Number,
        bmi: Number,
        status: String,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    bloodPressures: [
      {
        systolic: Number,
        diastolic: Number,
        status: String,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    hemoglobins: [
      {
        hemoglobin: Number,
        trimester: String,
        status: String,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    urines: [
      {
        urine: String,
        status: String,
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

MommyDetailSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.hpht) {
    const from = moment();
    const to = moment(obj.hpht);
    const days = Math.abs(
      moment(from, 'YYYY-MM-DD')
        .startOf('day')
        .diff(moment(to, 'YYYY-MM-DD').startOf('day'), 'days')
    );
    obj.pregnancyAge = days;
  }
  return obj;
};
