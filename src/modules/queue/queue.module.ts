import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { UserModule } from '@modules/user/user.module';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ImageUploadProcessor } from './image-upload.processor';
import { QueueService } from './queue.service';

const REDIS_CONN = {
  host: 'localhost',
  port: 6379,
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'imageUpload',
      redis: REDIS_CONN,
    }),
    forwardRef(() => UserModule),
    forwardRef(() => TocologistModule),
  ],
  providers: [QueueService, ImageUploadProcessor],
  exports: [QueueService],
})
export class QueueModule {}
