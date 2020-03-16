import { AppVersionModule } from '@modules/app-version/app-version.module';
import { ArticleModule } from '@modules/article/article.module';
import { AuthModule } from '@modules/auth/auth.module';
import { BabyModule } from '@modules/baby/baby.module';
import { CheckListModule } from '@modules/check-list/check-list.module';
import { ComboDataModule } from '@modules/combo-data/combo-data.module';
import { GeoReverseModule } from '@modules/geo-reverse/geo-reverse.module';
import { ImmunizationModule } from '@modules/immunization/immunization.module';
import { MythFactModule } from '@modules/myth-fact/myth-fact.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { PregnancyAgesModule } from '@modules/pregnancy-ages/pregnancy-ages.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { QuestionModule } from '@modules/question/question.module';
import { ReasonModule } from '@modules/reason/reason.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { RoleModule } from '@modules/role/role.module';
import { SeederModule } from '@modules/seeder/seeder.module';
import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
const DB_NAME = process.env.DB_NAME;
const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://localhost/${DB_NAME}`, MONGO_DB_OPTIONS),
    SeederModule,
    ComboDataModule,
    AuthModule,
    ProfileModule,
    PermissionModule,
    RoleModule,
    UserModule,
    AppVersionModule,
    TocologistServicesModule,
    TocologistModule,
    ArticleModule,
    ReservationModule,
    CheckListModule,
    QuestionModule,
    ReasonModule,
    NotificationModule,
    GeoReverseModule,
    MythFactModule,
    PregnancyAgesModule,
    BabyModule,
    ImmunizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
