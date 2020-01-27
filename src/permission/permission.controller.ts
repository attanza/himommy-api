import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
export class PermissionController {
  constructor(private dbService: PermissionService) {}

  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    return this.dbService.all(query);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(id);
    return apiItem('Permission', data);
  }

  @Post()
  async store(
    @Body(new ValidationPipe()) createDto: CreatePermissionDto,
  ): Promise<IApiItem> {
    const data = await this.dbService.store(createDto);
    return apiCreated('Permission', data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.update(id, updateDto);
    return apiUpdated('Permission', data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(id);
    return apiDeleted('Permission');
  }
}
