import { Redis } from '@/modules/helpers/redis';
import { QueueService } from '@/modules/queue/queue.service';
import { DbService } from '@/modules/shared/services/db.service';
import { TocologistServicesService } from '@/modules/tocologist-services/tocologist-services.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import {
  AttachTocologistServicesDto,
  UpdateTocologistDto,
} from './tocologist.dto';
import { ITocologist } from './tocologist.interface';

@Injectable()
export class TocologistService extends DbService {
  constructor(
    @InjectModel('Tocologist') private model: Model<ITocologist>,
    private tocologistServicesService: TocologistServicesService,
    private queueService: QueueService
  ) {
    super(model);
  }

  /**
   * PREPARE TOCOLOGIST DATA BEFORE INSERT INTO DATABASE
   * @param tocologistData
   */
  prepareTocologistData(tocologistData: UpdateTocologistDto) {
    const data = Object.assign({}, tocologistData) as any;
    const addressKeys = [
      'street',
      'country',
      'city',
      'district',
      'village',
      'postCode',
    ];
    const address = {};
    addressKeys.map(key => {
      if (tocologistData[key]) {
        address[key] = tocologistData[key];
        delete data[key];
      }
    });
    if (Object.keys(address).length > 0) {
      data.address = address;
    }
    if (tocologistData.latitude && tocologistData.longitude) {
      data.location = {
        type: 'Point',
        coordinates: [tocologistData.longitude, tocologistData.latitude],
      };
    }
    delete data.longitude;
    delete data.latitude;
    if (tocologistData.open && tocologistData.close) {
      data.operationTime = {
        open: tocologistData.open,
        close: tocologistData.close,
      };
      delete data.open;
      delete data.close;
    }
    return data;
  }

  /**
   * CHECK IF SERVICE NAME IS EXISTS IN TOCOLOGIST SERVICES DOCUMENT
   * @param servicesData
   */
  async checkServices(
    servicesData: AttachTocologistServicesDto
  ): Promise<void> {
    const services: string[] = [];
    if (
      servicesData &&
      servicesData.services &&
      servicesData.services.length > 0
    ) {
      servicesData.services.map(s => services.push(s.name));
      await this.tocologistServicesService.checkServicesExists(services);
    }
  }

  /**
   * ATTACH SERVICES INTO TOCOLOGIST
   * THIS WILL WORK FOR ATTACHING AND DETACHING
   * FOR DETACHING, JUST SEND EMPTY ARRAY
   * @param id
   * @param servicesData
   */
  async attachServices(id: string, servicesData: AttachTocologistServicesDto) {
    return await this.update({
      modelName: 'Tocologist',
      id,
      updateDto: { services: servicesData.services },
    });
  }

  /**
   * UPLOAD TOCOLOGIST IMAGE
   * @param id
   * @param image
   */
  async saveImage(id: string, image: any): Promise<ITocologist> {
    const found: ITocologist = await this.getById({ id });
    if (!found) {
      await fs.promises.unlink(image.path);
      throw new BadRequestException('Tocologist not found');
    }
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + found.image;
    found.image = imageString;
    try {
      await Promise.all([
        found.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern(`Tocologist_${id}`),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return found;
  }
}
