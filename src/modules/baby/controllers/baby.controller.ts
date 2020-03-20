import { Permission } from '@guards/permission.decorator';
import { PermissionGuard } from '@guards/permission.guard';
import { imageDownloadInterceptor } from '@modules/helpers/imageDownloadInterceptor';
import { apiUpdated } from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { BabyDetailDataPipe } from '@modules/shared/pipes/mongo-babyDetail.pipe';
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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { BabyService } from '../baby.service';
import { ValidateBabyDetail } from '../dto/baby-baby-detail.dto';
import { CreateBabyDto, UpdateBabyDto } from '../dto/baby.dto';

@Controller('admin/babies')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class BabyController {
  modelName = 'Baby';
  constructor(private dbService: BabyService) {}

  @Get()
  @Permission('read-baby')
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['name'];
    const keyValueSearchable = ['sex'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }

  @Get(':id')
  @Permission('read-baby')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Permission('create-baby')
  async store(
    @Body(new ValidationPipe()) createDto: CreateBabyDto
  ): Promise<IApiItem> {
    await this.dbService.checkUser(createDto.parent);
    return await this.dbService.store({ modelName: this.modelName, createDto });
  }

  @Put(':id')
  @Permission('update-baby')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateBabyDto
  ): Promise<IApiItem> {
    const { id } = param;
    if (updateDto.parent) {
      await this.dbService.checkUser(updateDto.parent);
    }

    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Permission('delete-baby')
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
  @Permission('update-baby')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', imageDownloadInterceptor('./public/babies'))
  )
  async uploadFile(@Param() param: MongoIdPipe, @UploadedFile() image) {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }

    const { id } = param;
    const updated = await this.dbService.saveImage(id, image);
    return apiUpdated('Baby', updated);
  }

  /**
   * Insert Photo, Height, Weight, Immunization
   */
  @Post('/:id/:babyDetailData')
  @Permission('update-baby')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  async storeBabyDetailData(
    @Param() param: BabyDetailDataPipe,
    @Req() request: Request
  ) {
    const { babyDetailData } = param;
    await ValidateBabyDetail(babyDetailData, request);
    return this.dbService.saveBabyDetail(request);
  }
}
