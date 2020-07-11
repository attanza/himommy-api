import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { imageDownloadInterceptor } from '@/modules/helpers/imageDownloadInterceptor';
import { Redis } from '@/modules/helpers/redis';
import { apiCreated } from '@/modules/helpers/responseParser';
import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import {
  IApiCollection,
  IApiItem,
} from '@/modules/shared/interfaces/response-parser.interface';
import { BabyDetailDataPipe } from '@/modules/shared/pipes/mongo-babyDetail.pipe';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@/modules/user/user.interface';
import {
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
import { ValidateBabyDetail } from '../dto/baby-detail.dto';
import { MobileCreateBabyDto, UpdateBabyDto } from '../dto/baby.dto';
import { ValidateUpdateBabyDetail } from '../dto/update-baby-detail.dto';

@Controller('mobile/babies')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileBabyController {
  modelName = 'Baby';
  constructor(private dbService: BabyService) {}

  @Get()
  @Role('mommy')
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe
  ): Promise<IApiCollection> {
    const regexSearchable = ['name'];
    const keyValueSearchable = ['sex'];
    const customOptions = { parent: user._id };
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      customOptions,
    });
  }

  @Get(':id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async show(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.checkIsMyBaby(id, user._id);
    return await this.dbService.show({ modelName: this.modelName, id });
  }

  @Post()
  @Role('mommy')
  async store(
    @GetUser() user: IUser,
    @Body(new ValidationPipe()) createDto: MobileCreateBabyDto
  ): Promise<IApiItem> {
    createDto.parent = user._id;
    const data = await this.dbService.dbStore(this.modelName, createDto);
    return apiCreated('Baby', data);
  }

  @Put(':id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateBabyDto,
    @GetUser() user: IUser
  ): Promise<IApiItem> {
    const { id } = param;

    // Check if Baby
    await this.dbService.checkIsMyBaby(id, user._id);

    updateDto.parent = user._id;
    return await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
    });
  }

  @Delete(':id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async destroy(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe
  ): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.checkIsMyBaby(id, user._id);

    return await this.dbService.destroy({
      modelName: this.modelName,
      id,
      imageKey: 'image',
    });
  }

  /**
   * Insert Photo, Height, Weight, Immunization
   */
  @Post('/:id/:babyDetailData')
  @Role('mommy')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('photo', imageDownloadInterceptor('./public/babies'))
  )
  async storeBabyDetailData(
    @Param() param: BabyDetailDataPipe,
    @Req() request: Request,
    @GetUser() user: IUser,
    @UploadedFile() photo
  ) {
    const { babyDetailData, id } = param;
    await this.dbService.checkIsMyBaby(id, user._id);
    await ValidateBabyDetail(babyDetailData, request);
    await Redis.deletePattern(`Baby_${user._id}`);
    return this.dbService.saveBabyDetail(request, photo);
  }

  /**
   * Update Photo, Height, Weight, Immunization
   */
  @Put('/:id/:babyDetailData')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('photo', imageDownloadInterceptor('./public/babies'))
  )
  async updateBabyDetailData(
    @Param() param: BabyDetailDataPipe,
    @Req() request: Request,
    @UploadedFile() photo,
    @GetUser() user: IUser
  ) {
    const { babyDetailData, id } = param;
    await this.dbService.checkIsMyBaby(id, user._id);
    await ValidateUpdateBabyDetail(babyDetailData, request);
    await Redis.deletePattern(`Baby_${user._id}`);
    return this.dbService.updateBabyDetail(request, photo);
  }

  /**
   * Update Photo, Height, Weight, Immunization
   */
  @Delete('/:id/:babyDetailData')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async deleteBabyDetailData(
    @Param() param: BabyDetailDataPipe,
    @Req() request: Request,
    @GetUser() user: IUser
  ) {
    const { babyDetailData, id } = param;
    await this.dbService.checkIsMyBaby(id, user._id);
    await ValidateUpdateBabyDetail(babyDetailData, request);
    await Redis.deletePattern(`Baby_${user._id}`);
    return this.dbService.deleteBabyDetail(request);
  }
}
