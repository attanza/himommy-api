import { IBaby } from '@/modules/baby/baby.interface';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('resizeImage') private resizeImageQueue: Queue,
    @InjectQueue('deleteBabyPhotos') private deleteBabyPhotosQueue: Queue
  ) {}

  async resizeImage(image: any): Promise<void> {
    this.resizeImageQueue.add(
      'resizeImage',
      { image },
      {
        attempts: 3,
        removeOnComplete: true,
      }
    );
  }

  async deleteBabyPhotos(baby: IBaby): Promise<void> {
    this.deleteBabyPhotosQueue.add(
      'deleteBabyPhotos',
      { baby },
      {
        attempts: 3,
        removeOnComplete: true,
      }
    );
  }
}
