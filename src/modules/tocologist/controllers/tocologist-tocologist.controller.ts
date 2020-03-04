import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import { Redis } from '@modules/helpers/redis';
import tocologistImageInterceptor from '@modules/helpers/tocologistImageInterceptor';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import { IUser } from '@modules/user/user.interface';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { apiSucceed, apiUpdated } from '../../helpers/responseParser';
import { IApiItem } from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import {
  AttachTocologistServicesDto,
  UpdateTocologistDto,
} from '../tocologist.dto';
import { TocologistService } from '../tocologist.service';

@Controller('tocologist/tocologists')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class TocologistTocologistController {
  modelName = 'Tocologist';
  uniques = ['name', 'email', 'phone'];
  relations = [];
  constructor(private dbService: TocologistService) {}

  @Put(':id')
  @Role('tocologist')
  @UsePipes(ValidationPipe)
  async update(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateTocologistDto,
  ): Promise<IApiItem> {
    const { id } = param;
    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }
    const output = await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto,
      uniques: this.uniques,
      relations: this.relations,
    });
    if (output.data.user && output.data.user.length > 0) {
      output.data.user.map(u => Redis.del(`User_${u}`));
    }
    return output;
  }

  /**
   * Attach Services
   */

  @Put('/:id/services')
  @Role('tocologist')
  @UsePipes(ValidationPipe)
  async attachServices(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @Body() serviceDto: AttachTocologistServicesDto,
  ): Promise<IApiItem> {
    const { id } = param;

    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }
    await this.dbService.checkServices(serviceDto);
    const data = await this.dbService.attachServices(id, serviceDto);
    return apiUpdated(this.modelName, data);
  }

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @Role('tocologist')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', tocologistImageInterceptor))
  uploadFile(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @UploadedFile() image,
  ) {
    const { id } = param;

    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }

    this.dbService.saveImage(id, image);
    return apiSucceed('Image Uploaded, actual result will be sent via socket');
  }
}
