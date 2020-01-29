import { AuthModule } from '@modules/auth/auth.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { SeederModule } from '@modules/seeder/seeder.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './modules/role/role.module';
const DB_NAME = process.env.DB_NAME;
const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://localhost/${DB_NAME}`, MONGO_DB_OPTIONS),
    RoleModule,
    SeederModule,
    PermissionModule,
    UserModule,
    AuthModule,
    ProfileModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
