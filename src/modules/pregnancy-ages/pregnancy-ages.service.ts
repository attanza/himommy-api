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
  async saveImage(id: string, image: any): Promise<string> {
    const imageString = image.path.split('public')[1];

    const found = await this.getById({ id });
    if (!found) {
      fs.unlinkSync(image);
    } else {
      Promise.all([
        this.dbUpdate('PregnancyAges', id, { image: imageString }),
        resizeImage([image.path], 400),
      ]);
    }
    return this.getById({ id });
  }
}
