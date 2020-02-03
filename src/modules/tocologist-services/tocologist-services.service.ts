import { DbService } from '@modules/shared/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITocologistService } from './tocologist-services.interface';

@Injectable()
export class TocologistServicesService extends DbService {
  constructor(
    @InjectModel('TocologistService') model: Model<ITocologistService>,
  ) {
    super(model);
  }
}
