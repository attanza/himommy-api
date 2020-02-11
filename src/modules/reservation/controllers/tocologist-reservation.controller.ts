import { apiItem } from '@modules/helpers/responseParser';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { ITocologist } from '@modules/tocologist/tocologist.interface';
import { TocologistService } from '@modules/tocologist/tocologist.service';
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
import { UpdateTocologistReservationDto } from '../dto/todologist-reservation.dto';
import { EStatus, IReservation } from '../reservation.interface';
import { ReservationService } from '../reservation.service';

@Controller('tocologist/reservations')
@UseGuards(AuthGuard('jwt'))
export class TocologistReservationController {
  modelName = 'Reservation';
  relations = ['tocologist', 'user'];
  constructor(
    private reservationService: ReservationService,
    private tocologistService: TocologistService,
  ) {}

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection> {
    const regexSearchable = ['code', 'services.name'];
    const keyValueSearchable = ['user', 'tocologist', 'status'];

    const tocologist: ITocologist = await this.tocologistService.getByKey(
      'user',
      user._id,
    );
    const relations = ['user'];
    const customOptions = { tocologist: tocologist._id };

    return this.reservationService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      relations,
      customOptions,
    });
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem> {
    const tocologist: ITocologist = await this.tocologistService.getByKey(
      'user',
      user._id,
    );
    const { id } = param;
    const data = await this.reservationService.getMyReservationByTocologistId(
      tocologist._id,
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
    let updateData: any;

    const { id } = param;
    const data: IReservation = await this.reservationService.getById({ id });

    // Check if reservation existed
    if (!data) {
      throw new BadRequestException('Reservation not found');
    }

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

    if (status && status === EStatus.REJECTED) {
      if (!reason || reason === '') {
        throw new BadRequestException('reason is required');
      }

      updateData = { reason, status };
    }

    // COMPLETE_CONFIRM
    if (status && status === EStatus.COMPLETE_CONFIRM) {
      if (data.status !== EStatus.ACCEPTED) {
        throw new BadRequestException('reservation cannot be completed');
      }

      updateData = { reason, status };
    }

    // ACCEPTED
    if (status && status === EStatus.ACCEPTED) {
      updateData = { status };
    }

    // Check if services is existed
    if (updateData.services && updateData.services.length > 0) {
      await this.reservationService.checkServices(
        user.tocologist._id,
        updateData.services,
      );
    }

    return await this.reservationService.update({
      modelName: this.modelName,
      id,
      updateDto: updateData,
      relations: this.relations,
      topic: `reservations/${data.user._id}/${updateData.status}`,
    });
  }
}
