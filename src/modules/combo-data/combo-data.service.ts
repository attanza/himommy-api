import { Redis } from '@modules/helpers/redis';
import { IRole } from '@modules/role/role.interface';
import { RoleService } from '@modules/role/role.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ComboDataService {
  constructor(private readonly roleService: RoleService) {}

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
}
