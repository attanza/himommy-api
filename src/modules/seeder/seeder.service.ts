import { IAppVersion } from '@modules/app-version/app-version.interface';
import { IArticle } from '@modules/article/article.interface';
import { ICheckList } from '@modules/check-list/check-list.interface';
import { IMommyDetail } from '@modules/mommy-detail/mommy-detail.interface';
import { IMythFact } from '@modules/myth-fact/myth-fact.interface';
import { INotification } from '@modules/notification/notification.interface';
import { IPermission } from '@modules/permission/permission.interface';
import { IQuestion } from '@modules/question/question.interface';
import { EReasonCategory, IReason } from '@modules/reason/reason.interface';
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
    @InjectModel('CheckList')
    private checkListModel: Model<ICheckList>,
    @InjectModel('Question')
    private questionModel: Model<IQuestion>,
    @InjectModel('Reason')
    private reasonModel: Model<IReason>,
    @InjectModel('Notification')
    private notificationModel: Model<INotification>,
    @InjectModel('MythFact')
    private mythFactModel: Model<IMythFact>
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

    for (const role of roles) {
      const newRole = await this.roleModel.create({
        name: role,
        slug: paramCase(role),
      });
      await this.userModel.create({
        firstName: role,
        email: `${snakeCase(role)}@himommy.org`,
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
      'Reservation',
      'Article',
      'CheckList',
      'Question',
      'Reason',
      'Notification',
      'GeoReverse',
      'MythFact',
    ];
    const actions = ['Read', 'Create', 'Update', 'Delete'];
    const permissionsData = [];
    resources.map(r => {
      actions.map(a =>
        permissionsData.push({
          name: `${a} ${r}`,
          slug: paramCase(`${a} ${r}`),
        })
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
    await this.seedNotifications();
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

    const generateService = () => {
      // {
      //   name:
      //     mainServices[
      //       this.faker.integer({ min: 0, max: mainServices.length - 1 })
      //     ],
      //   price: this.faker.integer({ min: 100000, max: 1000000 }),
      // }
      const services = [];
      mainServices.map(s =>
        services.push({
          name: s,
          price: this.faker.integer({ min: 100000, max: 1000000 }),
        })
      );
      return services;
    };

    const tocologistData = [];
    for (let i = 0; i < 25; i++) {
      const services = generateService();
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

  async seedTocologistUser() {
    Redis.flushall();

    const tocologist = await this.tocologistModel.findOne();
    const user: IUser = await this.userModel
      .findOne({ email: 'tocologist@himommy.org' })
      .lean();
    tocologist.user = user;
    await tocologist.save();
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
        category:
          articleCategories[
            this.faker.integer({ min: 0, max: articleCategories.length - 1 })
          ],
        isPublish: bools[this.faker.integer({ min: 0, max: 1 })],
        isAuth: bools[this.faker.integer({ min: 0, max: 1 })],
      });
    }
    await this.articleModel.insertMany(articleData);
    Logger.log('Seeding Article  Finish');
  }

  /**
   * CheckList Seeder
   */
  async seedCheckList() {
    Logger.log('Seeding Check List ...');
    await this.checkListModel.deleteMany({});
    const checkListCategory = [
      'LABORATORY',
      'NUTRITION',
      'HEALTH',
      'PREGNANCY_PREPARATION',
      'PREGNANCY_SIGNS',
    ];

    const checkListData = [];

    for (let i = 0; i < 100; i++) {
      checkListData.push({
        category:
          checkListCategory[
            this.faker.integer({ min: 0, max: checkListCategory.length - 1 })
          ],
        item: this.faker.sentence(),
        description: '',
      });
    }

    await this.checkListModel.insertMany(checkListData);

    Logger.log('Seeding Check List Finish');
  }

  /**
   * Question Seeder
   */
  async seedQuestions() {
    Logger.log('Seeding Questions ...');
    await this.questionModel.deleteMany({});

    const questionData = [];

    for (let i = 1; i < 11; i++) {
      for (let k = 0; k < 10; k++) {
        const question = {
          question: this.faker.sentence(),
          level: i,
          description: '',
          answers: [],
        };
        const answers = [];
        for (let j = 0; j < 3; j++) {
          answers.push({
            answer: this.faker.sentence(),
            isCorrectAnswer: false,
          });
        }
        answers.push({
          answer: this.faker.sentence(),
          isCorrectAnswer: true,
        });
        question.answers = answers;
        questionData.push(question);
      }
    }
    await this.questionModel.insertMany(questionData);
    Logger.log('Seeding Question Finish');
  }

  /**
   * Reason Seeder
   */
  async seedReasons() {
    Logger.log('Seeding Reason ...');
    await this.reasonModel.deleteMany({});
    const reasons = [
      {
        category: EReasonCategory.ORDER_CANCEL,
        reason: 'Bidan tidak di tempat',
      },
      {
        category: EReasonCategory.ORDER_CANCEL,
        reason: 'Jadwal tidak cocok',
      },
      {
        category: EReasonCategory.ORDER_REJECT,
        reason: 'Layanan tidak tersedia',
      },
      {
        category: EReasonCategory.ORDER_REJECT,
        reason: 'Pasien melebihi quota',
      },
    ];

    await this.reasonModel.insertMany(reasons);
    Logger.log('Seeding Reason Finish');
  }

  /**
   * Notification Seeder
   */
  async seedNotifications() {
    Logger.log('Seeding Notification ...');
    await this.notificationModel.deleteMany({});

    const notifications = [];
    const user = await this.userModel.findOne({ email: 'mommy@himommy.org' });
    for (let i = 0; i < 25; i++) {
      notifications.push({
        user: user._id,
        title: this.faker.sentence(),
        content: this.faker.sentence(),
      });
    }

    const tocologist = await this.userModel.findOne({
      email: 'tocologist@himommy.org',
    });
    for (let i = 0; i < 25; i++) {
      notifications.push({
        user: tocologist._id,
        title: this.faker.sentence(),
        content: this.faker.sentence(),
      });
    }

    await this.notificationModel.insertMany(notifications);
    Logger.log('Seeding Notification Finish');
  }

  /**
   * Myth Fact Seeder
   */
  async seedMythFact() {
    Logger.log('Seeding Myth Fact ...');
    await this.mythFactModel.deleteMany({});

    const mythFacts = [];
    for (let i = 0; i < 25; i++) {
      mythFacts.push({
        title: this.faker.sentence(),
        subtitle: this.faker.sentence(),
        description: this.faker.sentence(),
        myth: this.faker.paragraph(),
        fact: this.faker.paragraph(),
        image: 'https://picsum.photos/400/200',
        isPublish: true,
      });
    }

    await this.mythFactModel.insertMany(mythFacts);
    Logger.log('Seeding Myth Fact Finish');
  }
}
