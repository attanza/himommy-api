import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
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
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import { TocologistServicesService } from '../tocologist-services.service';

@Controller('tocologist/tocologist-services')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class TocologistTocologistServicesController {
  modelName = 'Tocologist Service';
  uniques = ['name'];
  constructor(private dbService: TocologistServicesService) {}

  @Get()
  @Role('tocologist')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Role('tocologist')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }
}
