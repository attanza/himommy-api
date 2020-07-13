import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import {
  IApiCollection,
  IApiItem,
} from '@/modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import {
  ESortMode,
  ResourcePaginationPipe,
} from '@/modules/shared/pipes/resource-pagination.pipe';
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
import { ImmunizationService } from '../immunization.service';

@Controller('mobile/immunizations')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileImmunizationController {
  modelName = 'Immunization';
  uniques = ['name'];
  constructor(private dbService: ImmunizationService) {}

  @Get()
  @Role('mommy')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'age'];
    const keyValueSearchable = ['age'];
    if (!query.sortBy) {
      query.sortBy = 'age';
      query.sortMode = ESortMode.asc;
    }
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
    return await this.dbService.show({ modelName: this.modelName, id });
  }
}
