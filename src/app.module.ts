import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { SeederModule } from './seeder/seeder.module';
import { UserModule } from './user/user.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
