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
import { CreateReasonDto, UpdateReasonDto } from '../Reason.dto';
import { ReasonService } from '../reason.service';

@Controller('admin/reasons')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ReasonController {
  modelName = 'Reason';
  constructor(private dbService: ReasonService) {}
  uniques = ['reason'];
  @Get()
  @Permission('read-reason')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['reason'];
    const keyValueSearchable = ['category'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-reason')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-reason')
  async store(
    @Body(new ValidationPipe()) createDto: CreateReasonDto,
  ): Promise<IApiItem> {
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
    });
  }

  @Put(':id')
  @Permission('update-reason')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateReasonDto,
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
      uniques: this.uniques,
    });
  }

  @Delete(':id')
  @Permission('delete-reason')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
