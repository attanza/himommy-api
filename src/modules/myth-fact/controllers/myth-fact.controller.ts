import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import { apiUpdated } from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMythFactDto, UpdateMythFactDto } from '../myth-fact.dto';
import { MythFactService } from '../myth-fact.service';
import mythFactInterceptor from '../mythFactInterceptor';

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

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @Permission('update-myth-fact')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', mythFactInterceptor))
  async uploadFile(@Param() param: MongoIdPipe, @UploadedFile() image) {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }

    const { id } = param;
    const updated = await this.dbService.saveImage(id, image);
    return apiUpdated('Myth Fact', updated);
  }
}
