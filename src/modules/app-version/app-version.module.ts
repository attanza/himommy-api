import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersionController } from './app-version.controller';
import { AppVersionSchema } from './app-version.schema';
import { AppVersionService } from './app-version.service';
import { MobileAppVersionController } from './mobile-app-version.controller';
import { TocologistAppVersionController } from './tocologist-app-version.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppVersion', schema: AppVersionSchema },
    ]),
  ],
  controllers: [
    AppVersionController,
    MobileAppVersionController,
    TocologistAppVersionController,
  ],
  providers: [AppVersionService],
})
export class AppVersionModule {}
