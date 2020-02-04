import { DbService } from '@modules/shared/db.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITocologistService } from './tocologist-services.interface';

@Injectable()
export class TocologistServicesService extends DbService {
  serviceModel: Model<ITocologistService>;
  constructor(
    @InjectModel('TocologistService') model: Model<ITocologistService>,
  ) {
    super(model);
    this.serviceModel = model;
  }

  async checkServicesExists(services: string[]) {
    if (services && services.length > 0) {
      const count = await this.serviceModel.countDocuments({
        name: { $in: services },
      });
      if (count !== services.length) {
        throw new HttpException(
          'One or more service name does not exists in database',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
