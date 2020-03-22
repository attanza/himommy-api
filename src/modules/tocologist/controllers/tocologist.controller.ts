import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import { Redis } from '@modules/helpers/redis';
import tocologistImageInterceptor from '@modules/helpers/tocologistImageInterceptor';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
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
import { apiSucceed } from '../../helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import {
  AttachTocologistServicesDto,
  CreateTocologistDto,
  UpdateTocologistDto,
} from '../tocologist.dto';
import { TocologistService } from '../tocologist.service';

@Controller('admin/tocologists')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class TocologistController {
  modelName = 'Tocologist';
  uniques = ['name', 'email', 'phone'];
  relations = [];
  constructor(private dbService: TocologistService) {}

  @Get()
  @Permission('read-tocologist')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'email', 'phone'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-tocologist')
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
  @Permission('create-tocologist')
  async store(
    @Body(new ValidationPipe()) createDto: CreateTocologistDto
  ): Promise<IApiItem> {
    const tocologistData = this.dbService.prepareTocologistData(createDto);
    return await this.dbService.store({
      modelName: this.modelName,
      createDto: tocologistData,
      uniques: this.uniques,
    });
  }

  @Put(':id')
  @Permission('update-tocologist')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateTocologistDto
  ): Promise<IApiItem> {
    try {
      const { id } = param;
      const tocologistData = this.dbService.prepareTocologistData(updateDto);
      const output = await this.dbService.update({
        modelName: this.modelName,
        id,
        updateDto: tocologistData,
        uniques: this.uniques,
        relations: this.relations,
      });
      if (output.data.user && output.data.user.length > 0) {
        output.data.user.map(user => Redis.del(`User_${user}`));
      }
      return output;
    } catch (error) {
      Logger.log(JSON.stringify(error));
    }
  }

  @Delete(':id')
  @Permission('delete-tocologist')
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
   * Attach Services
   */

  @Put('/:id/services')
  @Permission('update-tocologist')
  @UsePipes(ValidationPipe)
  async attachServices(
    @Param() param: MongoIdPipe,
    @Body() serviceDto: AttachTocologistServicesDto
  ): Promise<IApiItem> {
    await this.dbService.checkServices(serviceDto);
    const { id } = param;
    return this.dbService.attachServices(id, serviceDto);
  }

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @Permission('update-tocologist')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', tocologistImageInterceptor))
  async uploadFile(@Param() param: MongoIdPipe, @UploadedFile() image) {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }

    const { id } = param;
    const found = await this.dbService.getById({ id });
    if (!found) {
      throw new BadRequestException('Tocologist not found');
    }
    await this.dbService.saveImage(id, image);
    return apiSucceed('Image Uploaded, actual result will be sent via socket');
  }
}
