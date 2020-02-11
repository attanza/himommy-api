import { MommyDetailModule } from '@modules/mommy-detail/mommy-detail.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MobileProfileController } from './controllers/mobile-profile.controller';
import { ProfileController } from './controllers/profile.controller';
import { TocologistProfileController } from './controllers/tocologist-profile.controller';
import { ProfileService } from './profile.service';

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
