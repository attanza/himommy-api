import mqttHandler from '@modules/helpers/mqttHandler';
import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { IImageUpload } from '@modules/shared/interfaces/image-upload.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { UserService } from '@modules/user/user.service';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';

@Processor('imageUpload')
export class ImageUploadProcessor {
  constructor(
    private readonly userService: UserService,
    private readonly tocologistService: TocologistService
  ) {}
  private readonly logger = new Logger(ImageUploadProcessor.name);

  @Process('imageUpload')
  async handleImageUpload(job: Job) {
    try {
      this.logger.debug('handleImageUpload starting ... ' + new Date());
      const imageUploadData: IImageUpload = job.data;
      const {
        image,
        modelName,
        modelId,
        mqttTopic,
        imageKey,
        redisKey,
      } = imageUploadData;
      const imageString = image.path.split('public')[1];
      let model: any = await this.getModel(modelName, modelId);
      if (!model) {
        await fs.promises.unlink(image.path);
        this.logger.debug('No model', 'Image Upload Processor');
        this.logger.debug(
          'handleImageUpload completed ' + new Date(),
          'Image Upload Processor'
        );

        return false;
      } else {
        const fileExists = this.checkFileExist('public' + model[imageKey]);
        if (fileExists && fileExists.isFile()) {
          await fs.promises.unlink('public' + model[imageKey]);
          this.logger.debug(
            'Old image exists and deleted',
            'Image Upload Processor'
          );
        }
        model[imageKey] = imageString;
        await Promise.all([
          resizeImage([image.path], 400),
          model.save(),
          Redis.deletePattern(redisKey),
        ]);
        if (mqttTopic && mqttTopic !== '') {
          mqttHandler.sendMessage(
            mqttTopic,
            `${process.env.APP_URL}${imageString}`
          );
        }
      }

      this.logger.debug('handleImageUpload completed ' + new Date());
    } catch (error) {
      console.log('error', error);
    }
  }

  async getModel<T>(modelName: string, id: string): Promise<T> {
    if (modelName === 'User') {
      return this.userService.getById({ id });
    }
    if (modelName === 'Tocologist') {
      return this.tocologistService.getById({
        id,
      });
    }
    return null;
  }

  checkFileExist(path: string) {
    console.log('path', path);
    try {
      return fs.statSync(path);
    } catch (ex) {}
    return false;
  }
}
