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
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';

@Controller('admin/roles')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  modelName = 'Role';
  uniques = ['name'];
  relations = ['permissions'];
  constructor(private dbService: RoleService) {}

  @Get()
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
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(this.modelName, id, this.relations);
    return apiItem(this.modelName, data);
  }

  @Post()
  async store(
    @Body(new ValidationPipe()) createDto: CreateRoleDto,
  ): Promise<IApiItem> {
    await this.dbService.checkPermissions(createDto.permissions);
    const data = await this.dbService.store(
      createDto,
      this.uniques,
      this.relations,
    );
    return apiCreated(this.modelName, data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateRoleDto,
  ): Promise<IApiItem> {
    await this.dbService.checkPermissions(updateDto.permissions);

    const { id } = param;
    const data = await this.dbService.update(
      this.modelName,
      id,
      updateDto,
      this.uniques,
      this.relations,
    );
    return apiUpdated(this.modelName, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(this.modelName, id);
    return apiDeleted(this.modelName);
  }
}
