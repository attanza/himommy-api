import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DbService } from '../shared/services/db.service';
import { IAppVersion } from './app-version.interface';

@Injectable()
export class AppVersionService extends DbService {
  constructor(@InjectModel('AppVersion') private model: Model<IAppVersion>) {
    super(model);
  }

  async getByPlatform(platform: string) {
    return await this.model.findOne({ platform });
  }
}
