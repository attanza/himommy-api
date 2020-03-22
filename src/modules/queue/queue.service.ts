import { IImageUpload } from '@modules/shared/interfaces/image-upload.interface';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('imageUpload') private imageUploadQueue: Queue) {}

  async imageUpload(imageUploadData: IImageUpload): Promise<void> {
    this.imageUploadQueue.add(
      'imageUpload',
      { ...imageUploadData },
      {
        attempts: 3,
        removeOnComplete: true,
      }
    );
  }
}
