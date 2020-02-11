import { PermissionService } from '@modules/permission/permission.service';
import { DbService } from '@modules/shared/services/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRole } from './role.interface';

@Injectable()
export class RoleService extends DbService {
  constructor(
    @InjectModel('Role') private model: Model<IRole>,
    private permissionService: PermissionService,
  ) {
    super(model);
  }

  async checkPermissions(permissions): Promise<void> {
    return await this.permissionService.checkPermissionArray(permissions);
  }
}
