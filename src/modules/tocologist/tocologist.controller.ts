import tocologistImageInterceptor from '@modules/helpers/tocologistImageInterceptor';
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
  apiCreated,
  apiDeleted,
  apiItem,
  apiSucceed,
  apiUpdated,
} from '../helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  AttachTocologistServicesDto,
  CreateTocologistDto,
  UpdateTocologistDto,
} from './tocologist.dto';
import { TocologistService } from './tocologist.service';

@Controller('admin/tocologists')
@UseGuards(AuthGuard('jwt'))
export class TocologistController {
  modelName = 'Tocologist';
  uniques = ['name', 'email', 'phone'];
  relations = [];
  constructor(private dbService: TocologistService) {}

  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name', 'email', 'phone'];
    const keyValueSearchable = [];
    return this.dbService.getPaginated(
      this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    );
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.show(this.modelName, id, this.relations);
    return apiItem(this.modelName, data);
  }

  @Post()
  async store(
    @Body(new ValidationPipe()) createDto: CreateTocologistDto,
  ): Promise<IApiItem> {
    const tocologistData = this.dbService.prepareTocologistData(createDto);
    const data = await this.dbService.store(tocologistData, this.uniques);
    return apiCreated(this.modelName, data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateTocologistDto,
  ): Promise<IApiItem> {
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
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(this.modelName, id);
    return apiDeleted(this.modelName);
  }

  /**
   * Attach Services
   */

  @Put('/:id/services')
  @UsePipes(ValidationPipe)
  async attachServices(
    @Param() param: MongoIdPipe,
    @Body() serviceDto: AttachTocologistServicesDto,
  ): Promise<IApiItem> {
    await this.dbService.checkServices(serviceDto);
    const { id } = param;
    const data = await this.dbService.attachServices(id, serviceDto);
    return apiUpdated(this.modelName, data);
  }

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', tocologistImageInterceptor))
  uploadFile(@Param() param: MongoIdPipe, @UploadedFile() image) {
    if (!image)
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    const { id } = param;
    this.dbService.saveImage(id, image);
    return apiSucceed('Image Uploaded, actual result will be sent via socket');
  }
}
