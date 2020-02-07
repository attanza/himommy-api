import { GetUser } from '@modules/auth/get-user.decorator';
import mqttHandler from '@modules/helpers/mqttHandler';
import { apiItem, apiUpdated } from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EStatus } from './reservation.interface';
import { ReservationService } from './reservation.service';
import { UpdateTocologistReservationDto } from './todologist-reservation.dto';

@Controller('tocologist/reservations')
@UseGuards(AuthGuard('jwt'))
export class TocologistReservationController {
  modelName = 'Reservation';
  relations = ['tocologist', 'user'];
  constructor(private reservationService: ReservationService) {}

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection> {
    if (!user.tocologist) {
      throw new BadRequestException(
        'this user does not belongs to any tocologist',
      );
    }

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
    if (!user.tocologist) {
      throw new BadRequestException(
        'this user does not belongs to any tocologist',
      );
    }
    const { id } = param;
    const data = await this.reservationService.getMyReservationByTocologistId(
      user.tocologist._id,
      id,
    );
    return apiItem(this.modelName, data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateTocologistReservationDto,
    @GetUser() user: IUser,
  ) {
    if (!user.tocologist) {
      throw new BadRequestException(
        'this user does not belongs to any tocologist',
      );
    }
    let updateData: any;

    const { id } = param;
    let data = await this.reservationService.getById(id);

    // Check if reservation existed
    if (!data) {
      throw new BadRequestException('Reservation not found');
    }

    console.log('user', user);

    // check if reservation tocologist id === logged user id
    if (
      user.tocologist &&
      user.tocologist._id.toString() !== data.tocologist.toString()
    ) {
      throw new ForbiddenException('Action forbidden');
    }

    // ## STATUS ALLOWED FOR TOCOLOGIST
    // 1. NEW_TOCOLOGIST_UPDATE
    // 2. ACCEPTED
    // 3. REJECTED
    // 4. COMPLETE_CONFIRM

    // check if not allowed status
    const notAllowedStatus = [
      EStatus.CANCEL,
      EStatus.COMPLETED,
      EStatus.REJECTED,
      EStatus.NEW_TOCOLOGIST_UPDATE,
    ];
    if (notAllowedStatus.includes(data.status)) {
      throw new BadRequestException('Reservation cannot be modified');
    }

    updateData = Object.assign({}, updateDto);
    updateData.status = EStatus.NEW_TOCOLOGIST_UPDATE;

    // STATUS CHANGES

    // REJECTED
    const { reason, status } = updateDto;

    console.log('status', status);
    console.log('reason', reason);
    if (status && status === EStatus.REJECTED) {
      if (!reason || reason === '') {
        throw new BadRequestException('reason is required');
      }

      console.log('REJECTED updateData', updateData);
      updateData = { reason, status };
    }

    // COMPLETE_CONFIRM
    if (status && status === EStatus.COMPLETE_CONFIRM) {
      if (data.status !== EStatus.ACCEPTED) {
        throw new BadRequestException('reservation cannot be completed');
      }

      console.log('COMPLETE_CONFIRM updateData', updateData);
      updateData = { reason, status };
    }

    // ACCEPTED
    if (status && status === EStatus.ACCEPTED) {
      console.log('ACCEPTED updateData', updateData);
      updateData = { status };
    }

    // Check if services is existed
    if (updateData.services && updateData.services.length > 0) {
      await this.reservationService.checkServices(
        data.tocologist,
        updateData.services,
      );
    }

    console.log('final updateData', updateData);

    data = await this.reservationService.update(
      'Reservation',
      id,
      updateData,
      [],
      this.relations,
    );

    mqttHandler.sendMessage(
      `reservations/${data.user._id}/${updateData.status}`,
      JSON.stringify(data),
    );
    return apiUpdated('Reservation', data);
  }
}
