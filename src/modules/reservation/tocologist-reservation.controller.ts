import { GetUser } from '@modules/auth/get-user.decorator';
import { apiItem } from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationService } from './reservation.service';

@Controller('tocologist/reservations')
@UseGuards(AuthGuard('jwt'))
export class TocologistReservationController {
  modelName = 'Reservation';
  relations = ['user'];
  constructor(private reservationService: ReservationService) {}

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection> {
    const regexSearchable = ['code', 'services.name'];
    const keyValueSearchable = ['user', 'tocologist', 'status'];
    const relations = ['user'];
    query.fieldKey = 'tocologist';
    query.fieldValue = user.tocologist._id;

    return this.reservationService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      relations,
    });
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.reservationService.getMyReservationByTocologistId(
      user.tocologist._id,
      id,
    );
    return apiItem(this.modelName, data);
  }
}
