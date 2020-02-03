import { DbService } from '@modules/shared/db.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPermission } from '../permission/permission.interface';
import { IRole } from './role.interface';

@Injectable()
export class RoleService extends DbService {
  constructor(
    @InjectModel('Role') private model: Model<IRole>,
    @InjectModel('Permission') private permissionModel: Model<IPermission>,
  ) {
    super(model);
  }

  async checkPermissions(permissions): Promise<void> {
    if (permissions && permissions.length > 0) {
      const count = await this.permissionModel.countDocuments({
        _id: { $in: permissions },
      });
      if (count !== permissions.length) {
        throw new HttpException(
          'One or more permission is not exists in database',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
