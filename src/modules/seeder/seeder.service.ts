import { IAppVersion } from '@modules/app-version/app-version.interface';
import { IPermission } from '@modules/permission/permission.interface';
import { IRole } from '@modules/role/role.interface';
import { ITocologistService } from '@modules/tocologist-services/tocologist-services.interface';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { IUser } from '@modules/user/user.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Chance from 'chance';
import { paramCase, snakeCase } from 'change-case';
import { Model } from 'mongoose';
import RedisInstance from '../helpers/redis';
const mainServices = [
  'Pertolongan Persalinan',
  'Pemeriksaan kehamilan',
  'Pemeriksaan Ibu Nifas',
  'Pemeriksaan Bayi',
  'Pemeriksaan Anak',
  'Keluarga Berencana',
  'Imunisasi',
  'Pengambilan Pap Smear',
  'Labolatorium Sederhana',
  'Konseling',
];

@Injectable()
export class SeederService {
  private faker = new Chance();
  constructor(
    @InjectModel('Role') private roleModel: Model<IRole>,
    @InjectModel('Permission') private permissionModel: Model<IPermission>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('AppVersion') private appVersionModel: Model<IAppVersion>,
    @InjectModel('TocologistService')
    private tocologistServiceModel: Model<ITocologistService>,
    @InjectModel('Tocologist')
    private tocologistModel: Model<ITocologist>,
  ) {}

  /**
   * User Role Permission Seeder
   */
  async seedUserRolePermission() {
    Logger.log('Seeding Role and Users ...');
    await this.roleModel.deleteMany({});
    await this.userModel.deleteMany({});

    RedisInstance.flushall();

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

    const resources = [
      'Role',
      'Permission',
      'User',
      'Tocologist',
      'Tocologist Service',
      'App Version',
    ];
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

  /**
   * App Version Seeder
   */
  async seedAppVersion() {
    Logger.log('Seeding App Version ...');
    await this.appVersionModel.deleteMany({});

    const appVersionData = [
      { platform: 'android-mommy-app', version: '1.0.0' },
      { platform: 'ios-mommy-app', version: '1.0.0' },
      { platform: 'android-tocologist-app', version: '1.0.0' },
      { platform: 'ios-tocologist-app', version: '1.0.0' },
      { platform: 'dashboard', version: '1.0.0' },
    ];

    await this.appVersionModel.insertMany(appVersionData);
    Logger.log('Seeding App Version Finish');
  }

  /**
   * Tocologist Service Seeder
   */
  async seedTocologistService() {
    Logger.log('Seeding Tocologist Service ...');
    await this.tocologistServiceModel.deleteMany({});

    let tocologistServices = [];

    mainServices.map(s => tocologistServices.push({ name: s }));

    await this.tocologistServiceModel.insertMany(tocologistServices);
    Logger.log('Seeding Tocologist Service Finish');
  }

  /**
   * Tocologist Seeder
   */

  async seedTocologist() {
    Logger.log('Seeding Tocologist ...');
    await this.tocologistModel.deleteMany({});

    const generateService = () => ({
      name:
        mainServices[
          this.faker.integer({ min: 0, max: mainServices.length - 1 })
        ],
      price: this.faker.integer({ min: 100000, max: 1000000 }),
    });

    let tocologistData = [];
    for (let i = 0; i < 25; i++) {
      const services = [generateService(), generateService()];
      tocologistData.push({
        name: this.faker.company(),
        email: this.faker.email(),
        phone: this.faker.phone(),
        address: {
          street: this.faker.street(),
          country: this.faker.country(),
          city: this.faker.city(),
          district: this.faker.state(),
          village: this.faker.state(),
          postCode: this.faker.postcode(),
        },
        image: 'https://picsum.photos/400/200',
        isActive: true,
        operationTime: {
          open: '08:00',
          close: '20:00',
        },
        services,
        location: {
          type: 'Point',
          coordinates: [
            this.faker.longitude({ min: 107.4, max: 107.7, fixed: 7 }),
            this.faker.latitude({ min: -6.9, max: -6.8, fixed: 7 }),
          ],
        },

        holiday: ['0'],
      });
    }
    await this.tocologistModel.insertMany(tocologistData);
    Logger.log('Seeding Tocologist  Finish');
  }
}
