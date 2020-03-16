import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IPregnancyAges } from './pregnancy-ages.interface';

@Injectable()
export class PregnancyAgesService extends DbService {
  constructor(
    @InjectModel('PregnancyAges') private model: Model<IPregnancyAges>
  ) {
    super(model);
  }

  /**
   * UPLOAD PREGNANCY AGES IMAGE
   * @param id
   * @param image
   */
  async saveImage(id: string, image: any): Promise<IPregnancyAges> {
    const imageString = image.path.split('public')[1];

    const found: IPregnancyAges = await this.getById({ id });
    if (!found) {
      fs.promises.unlink(image);
    } else {
      this.unlinkImage(id, 'image');
      found.image = imageString;
      Promise.all([
        resizeImage([image.path], 400),
        found.save(),
        Redis.deletePattern('PregnancyAges_'),
      ]);
    }
    return found;
  }
}
