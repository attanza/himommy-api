import { Role } from '@/guards/role.decorator';
import { apiItem } from '@/modules/helpers/responseParser';
import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import { ITocologist } from '../tocologist.interface';
import { TocologistService } from '../tocologist.service';

@Controller('mobile/tocologists')
// @UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileTocologistController {
  modelName = 'Tocologist';
  uniques = ['name', 'email', 'phone'];
  relations = [];
  constructor(private dbService: TocologistService) {}

  @Get()
  @Role('mommy')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'email', 'phone', 'services.name'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({
      modelName: this.modelName,
      id,
      relations: this.relations,
    });
  }

  @Get('/getByUser/:id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async getByUser(@Param() param: MongoIdPipe) {
    const data: ITocologist = await this.dbService.getByKey('user', param.id);
    return apiItem('Tocologist', data);
  }
}
