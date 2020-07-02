import { UserModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileNotificationController } from './controllers/mobile-notification.controller';
import { NotificationController } from './controllers/notification.controller';
import { TocologistNotificationController } from './controllers/tocologist-notification.controller';
import { NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
    UserModule,
  ],
  controllers: [
    NotificationController,
    MobileNotificationController,
    TocologistNotificationController,
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
