import { Permission } from '@/guards/permission.decorator';
import { PermissionGuard } from '@/guards/permission.guard';
import { imageDownloadInterceptor } from '@/modules/helpers/imageDownloadInterceptor';
import { apiUpdated } from '@/modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@/modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
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
import { CreateArticleDto, UpdateArticleDto } from '../article.dto';
import { ArticleService } from '../article.service';

@Controller('admin/articles')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ArticleController {
  modelName = 'Article';
  constructor(private dbService: ArticleService) {}

  @Get()
  @Permission('read-article')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['slug'];
    const keyValueSearchable = ['age', 'isPublish', 'category', 'isAuth'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-article')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-article')
  async store(
    @Body(new ValidationPipe()) createDto: CreateArticleDto
  ): Promise<IApiItem> {
    return await this.dbService.store({ modelName: this.modelName, createDto });
  }

  @Put(':id')
  @Permission('update-article')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateArticleDto
  ): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Post('/:id/image-upload')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', imageDownloadInterceptor('public/articles'))
  )
  async uploadFile(@UploadedFile() image, @Param() param: MongoIdPipe) {
    if (!image) {
      throw new BadRequestException(
        'Image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }
    const { id } = param;

    const updated = await this.dbService.saveImage(image, id);
    return apiUpdated('Article image updated', updated);
  }

  @Delete(':id')
  @Permission('delete-article')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({
      modelName: this.modelName,
      id,
      imageKey: 'image',
    });
  }
}
