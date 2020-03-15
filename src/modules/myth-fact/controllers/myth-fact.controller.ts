import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
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
import { CreateMythFactDto, UpdateMythFactDto } from '../myth-fact.dto';
import { MythFactService } from '../myth-fact.service';

@Controller('admin/myth-facts')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MythFactController {
  modelName = 'MythFact';
  constructor(private dbService: MythFactService) {}

  @Get()
  @Permission('read-myth-fact')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['title'];
    const keyValueSearchable = ['isPublish'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-myth-fact')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-myth-fact')
  async store(
    @Body(new ValidationPipe()) createDto: CreateMythFactDto
  ): Promise<IApiItem> {
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
    });
  }

  @Put(':id')
  @Permission('update-myth-fact')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateMythFactDto
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Permission('delete-myth-fact')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
