import { AppVersionSchema } from '@/modules/app-version/app-version.schema';
import { ArticleSchema } from '@/modules/article/article.schema';
import { CheckListSchema } from '@/modules/check-list/check-list.schema';
import { ImmunizationSchema } from '@/modules/immunization/immunization.schema';
import { MommyDetailSchema } from '@/modules/mommy-detail/mommy-detail.schema';
import { MythFactSchema } from '@/modules/myth-fact/myth-fact.schema';
import { NotificationSchema } from '@/modules/notification/notification.schema';
import { PregnancyAgesSchema } from '@/modules/pregnancy-ages/pregnancy-ages.schema';
import { QuestionSchema } from '@/modules/question/question.schema';
import { ReasonSchema } from '@/modules/reason/reason.schema';
import { TocologistServiceSchema } from '@/modules/tocologist-services/tocologist-services.schema';
import { TocologistSchema } from '@/modules/tocologist/tocologist.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionSchema } from '../permission/permission.schema';
import { RoleSchema } from '../role/role.schema';
import { UserSchema } from '../user/user.schema';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Role', schema: RoleSchema },
      { name: 'Permission', schema: PermissionSchema },
      { name: 'User', schema: UserSchema },
      {
        name: 'AppVersion',
        schema: AppVersionSchema,
        collection: 'app_versions',
      },
      {
        name: 'TocologistService',
        schema: TocologistServiceSchema,
        collection: 'tocologist_services',
      },
      { name: 'Tocologist', schema: TocologistSchema },
      {
        name: 'MommyDetail',
        schema: MommyDetailSchema,
        collection: 'mommy_details',
      },
      { name: 'Article', schema: ArticleSchema },
      { name: 'CheckList', schema: CheckListSchema, collection: 'check_lists' },
      { name: 'Question', schema: QuestionSchema },
      { name: 'Reason', schema: ReasonSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'MythFact', schema: MythFactSchema, collection: 'myth_facts' },
      {
        name: 'PregnancyAges',
        schema: PregnancyAgesSchema,
        collection: 'pregnancy_ages',
      },
      {
        name: 'Immunization',
        schema: ImmunizationSchema,
        collection: 'immunizations',
      },
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
