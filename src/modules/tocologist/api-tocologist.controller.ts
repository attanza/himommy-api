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
import { apiItem } from '../helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { TocologistService } from './tocologist.service';

@Controller('api/tocologists')
@UseGuards(AuthGuard('jwt'))
export class ApiTocologistController {
  modelName = 'Tocologist';
  uniques = ['name', 'email', 'phone'];
  relations = [];
  constructor(private dbService: TocologistService) {}

  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'email', 'phone', 'services.name'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated(
      this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(this.modelName, id, this.relations);
    return apiItem(this.modelName, data);
  }
}
