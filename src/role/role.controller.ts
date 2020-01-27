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
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';

@Controller('admin/roles')
export class RoleController {
  constructor(private dbService: RoleService) {}

  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    return this.dbService.all(query);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(id);
    return apiItem('Role', data);
  }

  @Post()
  async store(
    @Body(new ValidationPipe()) createDto: CreateRoleDto,
  ): Promise<IApiItem> {
    const data = await this.dbService.store(createDto);
    return apiCreated('Role', data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateRoleDto,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.update(id, updateDto);
    return apiUpdated('Role', data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(id);
    return apiDeleted('Role');
  }
}
