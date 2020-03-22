import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ResizeImageProcessor } from './resize-image.processor';

const REDIS_CONN = {
  host: 'localhost',
  port: 6379,
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'resizeImage',
      redis: REDIS_CONN,
    }),
  ],
  providers: [QueueService, ResizeImageProcessor],
  exports: [QueueService],
})
export class QueueModule {}
