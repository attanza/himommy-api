import { AppVersionModule } from '@modules/app-version/app-version.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { SeederModule } from '@modules/seeder/seeder.module';
import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './modules/role/role.module';
const DB_NAME = process.env.DB_NAME;
const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://localhost/${DB_NAME}`, MONGO_DB_OPTIONS),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    RoleModule,
    SeederModule,
    PermissionModule,
    UserModule,
    AuthModule,
    ProfileModule,
    AppVersionModule,
    TocologistServicesModule,
    TocologistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
