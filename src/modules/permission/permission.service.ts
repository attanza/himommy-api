import { DbService } from '@modules/shared/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPermission } from './permission.interface';

@Injectable()
export class PermissionService extends DbService {
  constructor(@InjectModel('Permission') private model: Model<IPermission>) {
    super(model);
  }
}
