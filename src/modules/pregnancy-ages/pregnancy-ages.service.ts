import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPregnancyAges } from './pregnancy-ages.interface';

@Injectable()
export class PregnancyAgesService extends DbService {
  constructor(
    @InjectModel('PregnancyAges') private model: Model<IPregnancyAges>
  ) {
    super(model);
  }
}
