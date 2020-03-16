import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { IMythFact } from './myth-fact.interface';

@Injectable()
export class MythFactService extends DbService {
  constructor(@InjectModel('MythFact') private model: Model<IMythFact>) {
    super(model);
  }

  /**
   * UPLOAD MythFact IMAGE
   * @param id
   * @param image
   */
  async saveImage(id: string, image: any): Promise<IMythFact> {
    const imageString = image.path.split('public')[1];

    const found: IMythFact = await this.getById({ id });
    if (!found) {
      fs.unlinkSync(image);
    } else {
      this.unlinkImage(id, 'image');
      found.image = imageString;
      Promise.all([
        resizeImage([image.path], 400),
        found.save(),
        Redis.deletePattern('MythFact_'),
      ]);
    }
    return found;
  }
}
