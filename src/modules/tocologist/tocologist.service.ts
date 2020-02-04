import { DbService } from '@modules/shared/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateTocologistDto } from './tocologist.dto';
import { ITocologist } from './tocologist.interface';
@Injectable()
export class TocologistService extends DbService {
  constructor(@InjectModel('Tocologist') private model: Model<ITocologist>) {
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
}
