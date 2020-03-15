import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
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
import { PregnancyAgesService } from '../pregnancy-ages.service';

@Controller('mobile/pregnancy-ages')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobilePregnancyAgesController {
  modelName = 'PregnancyAges';
  constructor(private dbService: PregnancyAgesService) {}

  @Get()
  @Role('mommy')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['week, title'];
    const keyValueSearchable = ['isPublish'];
    const customOptions = { isPublish: true };
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      customOptions,
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
