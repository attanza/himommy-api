import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';

export default async (
  model: Model<any>,
  key: string,
  value: any,
  id?: string,
): Promise<boolean> => {
  if (key && value) {
    const options = {
      [key]: value,
    };
    const found = await model.findOne(options);
    if (id && found && found._id.toString() === id.toString()) {
      return true;
    }
    if (found) {
      throw new HttpException(`${key} already exists`, HttpStatus.BAD_REQUEST);
    }
  }

  return true;
};
