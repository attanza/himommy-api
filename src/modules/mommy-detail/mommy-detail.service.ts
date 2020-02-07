import { DbService } from '@modules/shared/db.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateMommyDto } from './mommy-detail.dto';
import { IMommyDetail } from './mommy-detail.interface';

@Injectable()
export class MommyDetailService extends DbService {
  constructor(@InjectModel('MommyDetail') private model: Model<IMommyDetail>) {
    super(model);
  }

  async createOrUpdateDetail(updateDto: UpdateMommyDto) {
    const { user } = updateDto;
    let data: IMommyDetail;
    data = await this.model.findOne({ user });
    if (!data) {
      data = await this.store(updateDto);
    } else {
      data = await this.update('Detail', data._id, updateDto);
    }
    return data;
  }

  async getByUserId(userId: string) {
    return await this.model.findOne({ user: userId });
  }
}
