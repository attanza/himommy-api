import { Injectable, Logger } from '@nestjs/common';
import { CreatePermissionDto } from 'src/permission/permission.dto';
import { PermissionService } from '../permission/permission.service';
import { CreateRoleDto } from '../role/role.dto';
import { RoleService } from '../role/role.service';

@Injectable()
export class SeederService {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  async seedRole() {
    Logger.log('Seeding Role ...');
    await this.roleService.removeAll();

    const roles = [
      'Super Administrator',
      'Administrator',
      'Mommy',
      'Tocologist',
    ];

    for (let i = 0; i < roles.length; i++) {
      const data: CreateRoleDto = { name: roles[i], description: '' };
      await this.roleService.store(data);
    }
    Logger.log('Seeding Role Finish');
  }

  async seedPermission() {
    Logger.log('Seeding Permission ...');

    await this.permissionService.removeAll();

    const resources = ['Role', 'Permission', 'User'];
    const actions = ['Read', 'Create', 'Update', 'Delete'];
    await this.roleService.removeAll();

    for (let i = 0; i < resources.length; i++) {
      for (let j = 0; j < actions.length; j++) {
        const data: CreatePermissionDto = {
          name: `${actions[j]} ${resources[i]}`,
          description: '',
        };
        await this.permissionService.store(data);
      }
    }
    Logger.log('Seeding Permission Finish');
  }
}
