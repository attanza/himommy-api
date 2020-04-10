import { Redis } from '@modules/helpers/redis';
import { IPermission } from '@modules/permission/permission.interface';
import { PermissionService } from '@modules/permission/permission.service';
import { IRole } from '@modules/role/role.interface';
import { RoleService } from '@modules/role/role.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ComboDataService {
  constructor(private readonly roleService: RoleService, private readonly permissionService: PermissionService) {}

  async getRole(): Promise<IRole[]> {
    const redisKey = 'Role_ComboData';
    const cache = await Redis.get(redisKey);
    if (cache != null) {
      Logger.log('Role ComboData from cache', 'DB Service');
      return JSON.parse(cache);
    }
    const data: IRole[] = await this.roleService.getForCombo();
    Redis.set(redisKey, JSON.stringify(data));
    return data;
  }

  async getPermission(): Promise<IPermission[]> {
    const redisKey = 'Role_Permission';
    const cache = await Redis.get(redisKey);
    if (cache != null) {
      Logger.log('Permission ComboData from cache', 'DB Service');
      return JSON.parse(cache);
    }
    const data: IPermission[] = await this.permissionService.getForCombo();
    Redis.set(redisKey, JSON.stringify(data));
    return data;
  }
}
