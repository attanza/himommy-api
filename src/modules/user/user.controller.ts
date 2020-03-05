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
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class UserController {
  modelName = 'User';
  uniques = ['phone', 'email'];
  relations = ['role'];
  constructor(private dbService: UserService) {}

  @Get()
  @Permission('read-user')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'phone', 'email'];
    const keyValueSearchable = ['role'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      relations: this.relations,
    });
  }

  @Get(':id')
  @Permission('read-user')
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
  @Permission('create-user')
  async store(
    @Body(new ValidationPipe()) createDto: CreateUserDto,
  ): Promise<IApiItem> {
    await this.dbService.checkRole(createDto.role);

    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
      relations: this.relations,
    });
  }

  @Put(':id')
  @Permission('update-user')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateUserDto,
  ): Promise<IApiItem> {
    await this.dbService.checkRole(updateDto.role);

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
  @Permission('delete-user')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
