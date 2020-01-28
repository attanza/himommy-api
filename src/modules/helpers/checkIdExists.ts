import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';

export default async (
  idsToCheck: string[],
  model: Model<any>,
): Promise<void> => {
  if (idsToCheck && idsToCheck.length > 0) {
    const count = await model.countDocuments({
      _id: { $in: idsToCheck },
    });
    if (count !== idsToCheck.length) {
      throw new HttpException(
        'One or more id is not exists in database',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
};
