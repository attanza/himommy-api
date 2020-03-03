import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import { Redis } from '@modules/helpers/redis';
import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '@modules/helpers/responseParser';
import { IResourcePagination } from '@modules/shared/interfaces/resource-pagination.interface';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { IPermission } from './permission.interface';
import { PermissionService } from './permission.service';

@Controller('admin/permissions')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PermissionController {
  private readonly modelName = 'Permission';
  private readonly uniques = ['name'];
  constructor(private dbService: PermissionService) {}

  @Get()
  @Permission('read-permission')
  @UsePipes(ValidationPipe)
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const args: IResourcePagination = {
      ...query,
      modelName: this.modelName,
      regexSearchable: ['slug'],
    };

    // Get form cache if exists
    const redisKey = this.modelName + '_' + Object.values(query).join('');
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      Logger.log(`${this.modelName} from cache`, 'DB SERVICE');
      return JSON.parse(cache);
    }

    // Get from DB
    const result = await this.dbService.getPaginated(args);
    if (!query.search || query.search === '') {
      Redis.set(redisKey, JSON.stringify(result));
    }

    return result;
  }

  @Get(':id')
  @Permission('read-permission')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const redisKey = `${this.modelName}_${id}`;
    const cache = await Redis.get(redisKey);
    if (cache && cache != null) {
      Logger.log(`${this.modelName} from cache`, 'DB SERVICE');
      return JSON.parse(cache);
    }
    const result: IPermission = await this.dbService.show({
      id,
      modelName: this.modelName,
    });
    const output = apiItem(this.modelName, result);
    Redis.set(redisKey, JSON.stringify(output));
    return output;
  }

  @Post()
  @Permission('create-permission')
  async store(
    @Body(new ValidationPipe()) createDto: CreatePermissionDto,
  ): Promise<IApiItem> {
    const result: IPermission = await this.dbService.store({
      createDto,
      uniques: this.uniques,
    });
    Redis.deletePattern(`${this.modelName}_`);
    return apiCreated(this.modelName, result);
  }

  @Put(':id')
  @Permission('update-permission')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<IApiItem> {
    const { id } = param;
    const result: IPermission = await this.dbService.update({
      id,
      updateDto,
      uniques: this.uniques,
      modelName: this.modelName,
    });
    Redis.deletePattern(`${this.modelName}_`);
    return apiUpdated(this.modelName, result);
  }

  @Delete(':id')
  @Permission('delete-permission')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy({
      id,
      modelName: this.modelName,
    });
    Redis.deletePattern(`${this.modelName}_`);
    return apiDeleted(this.modelName);
  }
}
