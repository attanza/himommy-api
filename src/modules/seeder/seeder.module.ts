import { AppVersionSchema } from '@modules/app-version/app-version.schema';
import { ArticleSchema } from '@modules/article/article.schema';
import { CheckListSchema } from '@modules/check-list/check-list.schema';
import { MommyDetailSchema } from '@modules/mommy-detail/mommy-detail.schema';
import { QuestionSchema } from '@modules/question/question.schema';
import { TocologistServiceSchema } from '@modules/tocologist-services/tocologist-services.schema';
import { TocologistSchema } from '@modules/tocologist/tocologist.schema';
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
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
