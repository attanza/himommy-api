import { UserSchema } from '@modules/user/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiProfileController } from './api-profile.controller';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [ProfileController, ApiProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
