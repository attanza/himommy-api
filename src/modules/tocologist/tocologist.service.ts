import { DbService } from '@modules/shared/db.service';
import { TocologistServicesService } from '@modules/tocologist-services/tocologist-services.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
  ) {
    super(model);
  }

  prepareTocologistData(tocologistData: UpdateTocologistDto) {
    let data = Object.assign({}, tocologistData);
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
    data['location'] = {
      coordinates: [tocologistData.longitude, tocologistData.latitude],
    };
    data['operationTime'] = {
      open: tocologistData.open,
      close: tocologistData.close,
    };
    return data;
  }

  async checkServices(
    servicesData: AttachTocologistServicesDto,
  ): Promise<void> {
    let services: string[] = [];
    if (
      servicesData &&
      servicesData.services &&
      servicesData.services.length > 0
    ) {
      servicesData.services.map(s => services.push(s.name));
      await this.tocologistServicesService.checkServicesExists(services);
    }
  }

  async attachServices(id: string, servicesData: AttachTocologistServicesDto) {
    return await this.update('Tocologist', id, {
      services: servicesData.services,
    });
  }
}
