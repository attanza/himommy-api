import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DeleteBabyPhotosProcessor } from './delete-baby-photos.processor';
import { QueueService } from './queue.service';
import { ResizeImageProcessor } from './resize-image.processor';

const REDIS_CONN = {
  host: process.env.REDIS_URL,
  port: 6379,
};

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'resizeImage',
        redis: REDIS_CONN,
      },
      {
        name: 'deleteBabyPhotos',
        redis: REDIS_CONN,
      }
    ),
  ],
  providers: [QueueService, ResizeImageProcessor, DeleteBabyPhotosProcessor],
  exports: [QueueService],
})
export class QueueModule {}
