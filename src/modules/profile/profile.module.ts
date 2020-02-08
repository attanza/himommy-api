import { MommyDetailModule } from '@modules/mommy-detail/mommy-detail.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MobileProfileController } from './mobile-profile.controller';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TocologistProfileController } from './tocologist-profile.controller';

@Module({
  imports: [UserModule, MommyDetailModule],
  controllers: [
    ProfileController,
    MobileProfileController,
    TocologistProfileController,
  ],
  providers: [ProfileService],
})
export class ProfileModule {}
