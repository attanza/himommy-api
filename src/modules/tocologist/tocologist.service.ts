import mqttHandler from '@modules/helpers/mqttHandler';
import { Redis } from '@modules/helpers/redis';
import resizeImage from '@modules/helpers/resizeImage';
import { DbService } from '@modules/shared/db.service';
import { TocologistServicesService } from '@modules/tocologist-services/tocologist-services.service';
import { Injectable } from '@nestjs/common';
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
  tocologistModel: Model<ITocologist>;
  constructor(
    @InjectModel('Tocologist') private model: Model<ITocologist>,
    private tocologistServicesService: TocologistServicesService,
  ) {
    super(model);
    this.tocologistModel = model;
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
    addressKeys.map(key => {
      if (tocologistData[key]) {
        data[key] = tocologistData[key];
      }
    });
    data.location = {
      coordinates: [tocologistData.longitude, tocologistData.latitude],
    };
    data.operationTime = {
      open: tocologistData.open,
      close: tocologistData.close,
    };
    return data;
  }

  /**
   * CHECK IF SERVICE NAME IS EXISTS IN TOCOLOGIST SERVICES DOCUMENT
   * @param servicesData
   */
  async checkServices(
    servicesData: AttachTocologistServicesDto,
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
  async saveImage(id: string, image: any): Promise<boolean> {
    const imageString = image.path.split('public')[1];

    const found = await this.getById({ id });
    if (!found) {
      fs.unlinkSync(image);
      return false;
    } else {
      Promise.all([
        this.dbUpdate(id, { image: imageString }),
        resizeImage([image.path], 400),
      ]);
      mqttHandler.sendMessage(
        `tocologist/${id}/image`,
        `${process.env.APP_URL}${imageString}`,
      );
    }
  }

  async getByUser(userId: string) {
    const redisKey = `Tocologist_user_${userId}`;
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      return JSON.parse(cache);
    }
    const data = await this.tocologistModel.findOne({ user: userId }).lean();
    Redis.set(redisKey, JSON.stringify(data));
    return data;
  }
}
