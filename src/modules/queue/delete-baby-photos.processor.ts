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
      for (const photo of photos) {
        try {
          const splitPhoto = photo.photo.split('babies')[1];
          await fs.promises.unlink('public/babies' + splitPhoto);
        } catch (e) {
          this.logger.debug(photo.photo + ' failed to delete');
        }
      }
    }
    this.logger.debug('handleDeleteBabyPhotos finish at ' + new Date());
  }
}
