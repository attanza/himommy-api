import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DbService } from '../shared/services/db.service';
import { EPlatform, IAppVersion } from './app-version.interface';

@Injectable()
export class AppVersionService extends DbService {
  constructor(@InjectModel('AppVersion') private model: Model<IAppVersion>) {
    super(model);
  }

  async getByPlatform(platform: EPlatform) {
    return await this.model.findOne({ platform });
  }
}
