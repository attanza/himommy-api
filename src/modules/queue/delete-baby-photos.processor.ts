import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';

@Processor('deleteBabyPhotos')
export class DeleteBabyPhotosProcessor {
  private readonly logger = new Logger(DeleteBabyPhotosProcessor.name);

  @Process('deleteBabyPhotos')
  async handleDeleteBabyPhotos(job: Job) {
    this.logger.debug('handleDeleteBabyPhotos starts at ' + new Date());
    const { photos } = job.data.baby;
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        try {
          const photo = photos[i].photo.split('babies')[1];
          await fs.promises.unlink('public/babies' + photo);
        } catch (e) {
          console.log('e', e);
        }
      }
    }
    this.logger.debug('handleDeleteBabyPhotos finish at ' + new Date());
  }
}
