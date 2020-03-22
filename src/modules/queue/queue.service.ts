import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('resizeImage') private resizeImageQueue: Queue) {}

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
}
