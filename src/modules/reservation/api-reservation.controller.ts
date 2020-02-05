import { PermissionGuard } from '@guards/permission.guard';
import { GetUser } from '@modules/auth/get-user.decorator';
import mqttHandler from '@modules/helpers/mqttHandler';
import { apiCreated, apiItem } from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationDto } from './reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('api/reservations')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ApiReservationController {
  modelName = 'Reservation';
  relations = ['user'];
  constructor(private reservationService: ReservationService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async store(
    @GetUser() user: IUser,
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<IApiItem> {
    const { tocologist, services } = createReservationDto;

    const serviceNames = [];
    services.map(s => serviceNames.push(s.name));
    await this.reservationService.checkServices(serviceNames);

    // Check Tocologist and user are exist
    await this.reservationService.checkTocologist(tocologist);

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
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.reservationService.show(
      this.modelName,
      id,
      this.relations,
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
    query.fieldKey = 'user';
    query.fieldValue = user._id;

    return this.reservationService.getPaginated(
      this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }
}
