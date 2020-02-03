import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiAppVersionController } from './api-app-version.controller';
import { AppVersionController } from './app-version.controller';
import { AppVersionSchema } from './app-version.schema';
import { AppVersionService } from './app-version.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppVersion', schema: AppVersionSchema },
    ]),
  ],
  controllers: [AppVersionController, ApiAppVersionController],
  providers: [AppVersionService],
})
export class AppVersionModule {}
