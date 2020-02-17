import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersionSchema } from './app-version.schema';
import { AppVersionService } from './app-version.service';
import { AppVersionController } from './controllers/app-version.controller';
import { MobileAppVersionController } from './controllers/mobile-app-version.controller';
import { TocologistAppVersionController } from './controllers/tocologist-app-version.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AppVersion',
        schema: AppVersionSchema,
        collection: 'app_versions',
      },
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
