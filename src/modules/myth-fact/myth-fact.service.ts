import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMythFact } from './myth-fact.interface';

@Injectable()
export class MythFactService extends DbService {
  constructor(@InjectModel('MythFact') private model: Model<IMythFact>) {
    super(model);
  }
}
