import { AppVersionSchema } from '@modules/app-version/app-version.schema';
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
      { name: 'AppVersion', schema: AppVersionSchema },
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
