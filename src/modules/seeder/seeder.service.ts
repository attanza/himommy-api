import { IPermission } from '@modules/permission/permission.interface';
import { IRole } from '@modules/role/role.interface';
import { IUser } from '@modules/user/user.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Chance from 'chance';
import { paramCase, snakeCase } from 'change-case';
import { Model } from 'mongoose';

@Injectable()
export class SeederService {
  private faker = new Chance();
  constructor(
    @InjectModel('Role') private roleModel: Model<IRole>,
    @InjectModel('Permission') private permissionModel: Model<IPermission>,
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}

  async seedUserRolePermission() {
    Logger.log('Seeding Role and Users ...');
    await this.roleModel.deleteMany({});
    await this.userModel.deleteMany({});

    const roles = [
      'Super Administrator',
      'Administrator',
      'Mommy',
      'Tocologist',
    ];

    for (const i in roles) {
      const newRole = await this.roleModel.create({
        name: roles[i],
        slug: paramCase(roles[i]),
      });
      await this.userModel.create({
        firstName: roles[i],
        email: `${snakeCase(roles[i])}@himommy.org`,
        password: 'password',
        phone: this.faker.phone(),
        role: newRole._id,
        isActive: true,
        authProvider: 'local',
      });
    }

    Logger.log('Seeding Role and Users Finish');

    Logger.log('Seeding Permission ...');

    await this.permissionModel.deleteMany({});

    const resources = ['Role', 'Permission', 'User'];
    const actions = ['Read', 'Create', 'Update', 'Delete'];
    let permissionsData = [];
    resources.map(r => {
      actions.map(a =>
        permissionsData.push({
          name: `${a} ${r}`,
          slug: paramCase(`${a} ${r}`),
        }),
      );
    });
    await this.permissionModel.insertMany(permissionsData);

    Logger.log('Seeding Permission Finish');

    Logger.log('Attach Permissions into Roles');
    const permissionIds = await this.permissionModel.find({}, { _id: 1 });
    let perIds = [];
    permissionIds.map(i => perIds.push(i._id));
    // Attach all permission for Super Administrator
    const superAdmin = await this.roleModel.findOne({
      slug: 'super-administrator',
    });
    superAdmin.permissions = perIds;
    await superAdmin.save();
  }
}
