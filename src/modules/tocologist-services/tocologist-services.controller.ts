import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  CreateTocologistServiceDto,
  UpdateTocologistServiceDto,
} from './tocologist-services.dto';
import { TocologistServicesService } from './tocologist-services.service';

@Controller('admin/tocologist-services')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class TocologistServicesController {
  modelName = 'Tocologist Service';
  uniques = ['name'];
  constructor(private dbService: TocologistServicesService) {}

  @Get()
  @Permission('read-tocologist-service')
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
  @Permission('read-tocologist-service')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-tocologist-service')
  async store(
    @Body(new ValidationPipe()) createDto: CreateTocologistServiceDto,
  ): Promise<IApiItem> {
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
    });
  }

  @Put(':id')
  @Permission('update-tocologist-service')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateTocologistServiceDto,
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
      uniques: this.uniques,
    });
  }

  @Delete(':id')
  @Permission('delete-tocologist-service')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
