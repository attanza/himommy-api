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
    });
  }

  @Get(':id')
  @Permission('read-user')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(this.modelName, id, this.relations);
    return apiItem(this.modelName, data);
  }

  @Post()
  @Permission('create-user')
  async store(
    @Body(new ValidationPipe()) createDto: CreateUserDto,
  ): Promise<IApiItem> {
    await this.dbService.checkRole(createDto.role);

    const data = await this.dbService.store(
      createDto,
      this.uniques,
      this.relations,
    );
    return apiCreated(this.modelName, data);
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
  @Permission('delete-user')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(this.modelName, id);
    return apiDeleted(this.modelName);
  }
}
