import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import { imageDownloadInterceptor } from '@modules/helpers/imageDownloadInterceptor';
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
import {
  CreatePregnancyAgesDto,
  UpdatePregnancyAgesDto,
} from '../pregnancy-ages.dto';
import { PregnancyAgesService } from '../pregnancy-ages.service';

@Controller('admin/pregnancy-ages')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PregnancyAgesController {
  modelName = 'PregnancyAges';
  constructor(private dbService: PregnancyAgesService) {}

  @Get()
  @Permission('read-pregnancy-age')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['title'];
    const keyValueSearchable = ['isPublish', 'week'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-pregnancy-age')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-pregnancy-age')
  async store(
    @Body(new ValidationPipe()) createDto: CreatePregnancyAgesDto
  ): Promise<IApiItem> {
    return await this.dbService.store({
      modelName: this.modelName,
      createDto,
    });
  }

  @Put(':id')
  @Permission('update-pregnancy-age')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePregnancyAgesDto
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Permission('delete-pregnancy-age')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({
      modelName: this.modelName,
      id,
      imageKey: 'image',
    });
  }

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @Permission('update-pregnancy-age')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', imageDownloadInterceptor('./public/pregnancyAges'))
  )
  async uploadFile(@Param() param: MongoIdPipe, @UploadedFile() image) {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }

    const { id } = param;
    const updated = await this.dbService.saveImage(id, image);
    return apiUpdated('Pregnancy Ages', updated);
  }
}
