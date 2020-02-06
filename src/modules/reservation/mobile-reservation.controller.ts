import { GetUser } from '@modules/auth/get-user.decorator';
import mqttHandler from '@modules/helpers/mqttHandler';
import { apiCreated, apiItem, apiUpdated } from '@modules/helpers/responseParser';
import { IApiCollection, IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationDto, UpdateReservationDto } from './reservation.dto';
import { EStatus } from './reservation.interface';
import { ReservationService } from './reservation.service';

@Controller('mobile/reservations')
@UseGuards(AuthGuard('jwt'))
export class MobileReservationController {
  modelName = 'Reservation';
  relations = ['user', 'tocologist'];
  constructor(private reservationService: ReservationService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async store(
    @GetUser() user: IUser,
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<IApiItem> {
    const { tocologist, services } = createReservationDto;

    await this.reservationService.checkServices(tocologist, services);

    const code = Math.floor(Date.now() / 1000).toString();
    const data = await this.reservationService.store(
      {
        ...createReservationDto,
        user: user._id,
        code,
      },
      [],
      this.relations,
    );

    mqttHandler.sendMessage(`reservations/${tocologist}`, JSON.stringify(data));
    return apiCreated(this.modelName, data);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.reservationService.getMyReservationById(
      user._id,
      id,
    );
    return apiItem(this.modelName, data);
  }

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection> {
    const regexSearchable = ['code', 'services.name'];
    const keyValueSearchable = ['user', 'tocologist'];
    const relations = ['tocologist'];
    query.fieldKey = 'user';
    query.fieldValue = user._id;

    return this.reservationService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      relations,
    });
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateReservationDto,
    @GetUser() user: IUser,
  ) {
    const { id } = param;
    let data = await this.reservationService.getById(id);
    if (!data) {
      throw new BadRequestException('Reservation not found');
    }
    if (data.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('Action forbidden');
    }
    if (data.status !== EStatus.NEW) {
      throw new BadRequestException('Reservation status not NEW');
    }
    if (
      updateDto.status === EStatus.CANCEL &&
      (!updateDto.reason || updateDto.reason === '')
    ) {
      throw new BadRequestException('reason is required');
    }

    await this.reservationService.checkServices(
      data.tocologist,
      updateDto.services,
    );

    data = await this.reservationService.update(
      'Reservation',
      id,
      updateDto,
      [],
      this.relations,
    );
    return apiUpdated('Reservation', data);
  }
}
