import { DbService } from '@modules/shared/db.service';
import { TocologistServicesService } from '@modules/tocologist-services/tocologist-services.service';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReservation } from './reservation.interface';

@Injectable()
export class ReservationService extends DbService {
  constructor(
    @InjectModel('Reservation') private model: Model<IReservation>,
    private tocologistService: TocologistService,
    private tocologistServiceService: TocologistServicesService,
  ) {
    super(model);
  }

  async checkTocologist(id: string): Promise<void> {
    await this.tocologistService.show('Tocologist', id);
  }

  async checkServices(services: string[]): Promise<void> {
    await this.tocologistServiceService.checkServicesExists(services);
  }
}
