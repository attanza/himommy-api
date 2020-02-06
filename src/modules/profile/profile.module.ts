import { MommyDetailModule } from '@modules/mommy-detail/mommy-detail.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MobileProfileController } from './mobile-profile.controller';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [UserModule, MommyDetailModule],
  controllers: [ProfileController, MobileProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
