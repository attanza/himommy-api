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
import { CreateCheckListDto, UpdateCheckListDto } from '../check-list.dto';
import { CheckListService } from '../check-list.service';

@Controller('admin/check-lists')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class CheckListController {
  modelName = 'CheckList';
  constructor(private dbService: CheckListService) {}

  @Get()
  @Permission('read-check-list')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['category', 'item'];
    const keyValueSearchable = ['category'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-check-list')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-check-list')
  async store(
    @Body(new ValidationPipe()) createDto: CreateCheckListDto,
  ): Promise<IApiItem> {
    return await this.dbService.store({ modelName: this.modelName, createDto });
  }

  @Put(':id')
  @Permission('update-check-list')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateCheckListDto,
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Permission('delete-check-list')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
