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
import {
  CreateImmunizationDto,
  UpdateImmunizationDto,
} from '../Immunization.dto';
import { ImmunizationService } from '../Immunization.service';

@Controller('admin/immunizations')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ImmunizationController {
  modelName = 'Immunization';
  uniques = ['name'];
  constructor(private dbService: ImmunizationService) {}

  @Get()
  @Permission('read-immunization')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'age'];
    const keyValueSearchable = ['age'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-immunization')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-immunization')
  async store(
    @Body(new ValidationPipe()) createDto: CreateImmunizationDto
  ): Promise<IApiItem> {
    return this.dbService.store({
      modelName: this.modelName,
      createDto,
      uniques: this.uniques,
    });
  }

  @Put(':id')
  @Permission('update-immunization')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateImmunizationDto
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Permission('delete-immunization')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
