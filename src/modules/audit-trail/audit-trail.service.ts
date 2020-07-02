import { DbService } from '@/modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAuditTrail } from './audit-trail.interface';

@Injectable()
export class AuditTrailService extends DbService {
  constructor(@InjectModel('AuditTrail') private model: Model<IAuditTrail>) {
    super(model);
  }
}
