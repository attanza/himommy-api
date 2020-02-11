import { IAppVersion } from '@modules/app-version/app-version.interface';
import { IArticle } from '@modules/article/article.interface';
import { IMommyDetail } from '@modules/mommy-detail/mommy-detail.interface';
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
import { Redis } from '../helpers/redis';
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
    @InjectModel('MommyDetail')
    private mommyDetailModel: Model<IMommyDetail>,
    @InjectModel('Article')
    private articleModel: Model<IArticle>,
  ) {}

  /**
   * User Role Permission Seeder
   */
  async seedUserRolePermission() {
    Logger.log('Seeding Role and Users ...');
    await this.roleModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.mommyDetailModel.deleteMany({});

    Redis.flushall();

    const roles = [
      'Super Administrator',
      'Administrator',
      'Mommy',
      'Tocologist',
    ];

    roles.map(async r => {
      const newRole = await this.roleModel.create({
        name: r,
        slug: paramCase(r),
      });
      await this.userModel.create({
        firstName: r,
        email: `${snakeCase(r)}@himommy.org`,
        password: 'password',
        phone: this.faker.phone(),
        role: newRole._id,
        isActive: true,
        authProvider: 'local',
      });
    });

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
      'Reservation',
      'Article',
    ];
    const actions = ['Read', 'Create', 'Update', 'Delete'];
    const permissionsData = [];
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
    const perIds = [];
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

    const tocologistServices = [];

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

    const tocologistData = [];
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

  /**
   * Article Seeder
   */
  async seedArticle() {
    Logger.log('Seeding Article ...');
    await this.articleModel.deleteMany({});

    const articleCategories = ['ARTICLES', 'MYTHS', 'TIPS'];
    const bools = [true, false];
    const articleData = [];

    for (let i = 0; i < 100; i++) {
      const title = this.faker.sentence();
      articleData.push({
        title,
        slug: paramCase(title),
        subtile: this.faker.sentence(),
        content: this.faker.paragraph(),
        age: this.faker.integer({ min: 0, max: 40 }),
        image: 'https://picsum.photos/400/200',
        category: articleCategories[this.faker.integer({ min: 0, max: 2 })],
        isPublish: bools[this.faker.integer({ min: 0, max: 1 })],
        isAuth: bools[this.faker.integer({ min: 0, max: 1 })],
      });
    }
    await this.articleModel.insertMany(articleData);
    Logger.log('Seeding Article  Finish');
  }

  async seedTocologistUser() {
    Redis.flushall();

    const tocologist = await this.tocologistModel.findOne();
    const user = await this.userModel
      .findOne({ email: 'tocologist@himommy.org' })
      .lean();
    tocologist.user = user;
    await tocologist.save();
  }
}
