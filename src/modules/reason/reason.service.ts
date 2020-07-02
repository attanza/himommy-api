import { DbService } from '@/modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReason } from './reason.interface';

@Injectable()
export class ReasonService extends DbService {
  constructor(@InjectModel('Reason') private model: Model<IReason>) {
    super(model);
  }
}
