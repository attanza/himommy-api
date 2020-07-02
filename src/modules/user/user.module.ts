import { MommyDetailModule } from '@/modules/mommy-detail/mommy-detail.module';
import { RoleModule } from '@/modules/role/role.module';
import { TocologistModule } from '@/modules/tocologist/tocologist.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from '../role/role.schema';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Role', schema: RoleSchema },
    ]),
    RoleModule,
    MommyDetailModule,
    forwardRef(() => TocologistModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
