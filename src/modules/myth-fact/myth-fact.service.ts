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
  async saveImage(id: string, image: any): Promise<string> {
    const imageString = image.path.split('public')[1];

    const found = await this.getById({ id });
    if (!found) {
      fs.unlinkSync(image);
    } else {
      Promise.all([
        this.dbUpdate('MythFact', id, { image: imageString }),
        resizeImage([image.path], 400),
      ]);
    }
    return this.getById({ id });
  }
}
