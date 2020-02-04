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
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { PermissionService } from './permission.service';

@Controller('admin/permissions')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PermissionController {
  modelName = 'Permission';
  uniques = ['name'];
  constructor(private dbService: PermissionService) {}

  @Get()
  @Permission('read-permission')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['slug'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated(
      this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  @Get(':id')
  @Permission('read-permission')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(this.modelName, id);
    return apiItem(this.modelName, data);
  }

  @Post()
  @Permission('create-permission')
  async store(
    @Body(new ValidationPipe()) createDto: CreatePermissionDto,
  ): Promise<IApiItem> {
    const data = await this.dbService.store(createDto, this.uniques);
    return apiCreated(this.modelName, data);
  }

  @Put(':id')
  @Permission('update-permission')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.update(
      this.modelName,
      id,
      updateDto,
      this.uniques,
    );
    return apiUpdated(this.modelName, data);
  }

  @Delete(':id')
  @Permission('delete-permission')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(this.modelName, id);
    return apiDeleted(this.modelName);
  }
}
