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
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { PermissionService } from './permission.service';

@Controller('admin/permissions')
// @UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PermissionController {
  modelName = 'Permission';
  uniques = ['name'];
  constructor(private dbService: PermissionService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('read-permission')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['slug'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-permission')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-permission')
  async store(
    @Body(new ValidationPipe()) createDto: CreatePermissionDto,
  ): Promise<IApiItem> {
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
    });
  }

  @Put(':id')
  @Permission('update-permission')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePermissionDto,
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
  @Permission('delete-permission')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
