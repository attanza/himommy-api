import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IImmunization } from './immunization.interface';

@Injectable()
export class ImmunizationService extends DbService {
  constructor(
    @InjectModel('Immunization') private model: Model<IImmunization>
  ) {
    super(model);
  }
}
