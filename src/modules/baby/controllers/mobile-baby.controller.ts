import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
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
import { BabyService } from '../baby.service';
import { CreateBabyDto, UpdateBabyDto } from '../dto/baby.dto';

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
    @Body(new ValidationPipe()) createDto: CreateBabyDto
  ): Promise<IApiItem> {
    createDto.parent = user._id;
    return await this.dbService.store({ modelName: this.modelName, createDto });
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
   * Image Upload
   */

  // @Post('/:id/image-upload')
  // @Permission('update-myth-fact')
  // @HttpCode(200)
  // @UseInterceptors(
  //   FileInterceptor('image', imageDownloadInterceptor('./public/babies'))
  // )
  // async uploadFile(
  //   @GetUser() user: IUser,
  //   @Param() param: MongoIdPipe,
  //   @UploadedFile() image
  // ) {
  //   if (!image) {
  //     throw new BadRequestException(
  //       'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
  //     );
  //   }

  //   const { id } = param;
  //   await this.dbService.checkIsMyBaby(id, user._id);

  //   const updated = await this.dbService.saveImage(id, image);
  //   return apiUpdated('Baby', updated);
  // }
}
