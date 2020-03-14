import { DbService } from '@modules/shared/services/db.service';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TServiceDto } from './dto/reservation.dto';
import { IReservation } from './reservation.interface';

@Injectable()
export class ReservationService extends DbService {
  constructor(
    @InjectModel('Reservation') private model: Model<IReservation>,
    private tocologistService: TocologistService
  ) {
    super(model);
  }

  async checkServices(
    id: string,
    requestedServices: TServiceDto[]
  ): Promise<void> {
    const data: ITocologist = await this.tocologistService.getById({
      modelName: 'Tocologist',
      id,
    });
    if (!data) {
      throw new BadRequestException('Tocologist not found');
    }
    if (!data.isActive) {
      throw new BadRequestException('Tocologist cannot received reservation');
    }
    if (requestedServices && requestedServices.length > 0) {
      const { services } = data;
      const tocologistServices = services.map(s => s.name);

      requestedServices.map(s => {
        if (!tocologistServices.includes(s.name)) {
          throw new BadRequestException(
            'One or more services is not available at the chosen Tocologist'
          );
        }
      });
    }
  }

  async getMyReservationById(
    userId: string,
    id: string
  ): Promise<IReservation> {
    const found: IReservation = await this.model
      .findOne({ user: userId, _id: id })
      .populate('tocologist')
      .lean();
    if (!found) {
      throw new BadRequestException('Reservation not found');
    }

    return found;
  }

  async getMyReservationByTocologistId(
    tocologistId: string,
    id: string
  ): Promise<IReservation> {
    const found = await this.model
      .findOne({ tocologist: tocologistId, _id: id })
      .populate('user');

    if (!found) {
      throw new BadRequestException('Reservation not found');
    }

    return found;
  }
}
