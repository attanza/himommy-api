import { Permission } from '@/guards/permission.decorator';
import { PermissionGuard } from '@/guards/permission.guard';
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
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';

@Controller('admin/roles')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class RoleController {
  modelName = 'Role';
  uniques = ['name'];
  relations = ['permissions'];
  constructor(private dbService: RoleService) {}

  @Get()
  @Permission('read-role')
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
  @Permission('read-role')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({
      modelName: this.modelName,
      id,
      relations: this.relations,
    });
  }

  @Post()
  @Permission('create-role')
  async store(
    @Body(new ValidationPipe()) createDto: CreateRoleDto
  ): Promise<IApiItem> {
    await this.dbService.checkPermissions(createDto.permissions);
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
      relations: this.relations,
    });
  }

  @Put(':id')
  @Permission('update-role')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateRoleDto
  ): Promise<IApiItem> {
    await this.dbService.checkPermissions(updateDto.permissions);

    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
      uniques: this.uniques,
      relations: this.relations,
    });
  }

  @Delete(':id')
  @Permission('delete-role')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
