import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { Redis } from '@/modules/helpers/redis';
import { apiUpdated } from '@/modules/helpers/responseParser';
import tocologistImageInterceptor from '@/modules/helpers/tocologistImageInterceptor';
import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import { IUser } from '@/modules/user/user.interface';
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
    @Body() updateDto: UpdateTocologistDto
  ): Promise<IApiItem> {
    const { id } = param;
    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }
    console.log('updateDto', updateDto);
    const tocologistData = this.dbService.prepareTocologistData(updateDto);

    const output = await this.dbService.update({
      modelName: this.modelName,
      id,
      updateDto: tocologistData,
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
    @Body() serviceDto: AttachTocologistServicesDto
  ): Promise<IApiItem> {
    const { id } = param;

    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }
    await this.dbService.checkServices(serviceDto);
    return this.dbService.attachServices(id, serviceDto);
  }

  /**
   * Image Upload
   */

  @Post('/:id/image-upload')
  @Role('tocologist')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', tocologistImageInterceptor))
  async uploadFile(
    @GetUser() user: IUser,
    @Param() param: MongoIdPipe,
    @UploadedFile() image
  ) {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB'
      );
    }
    const { id } = param;

    if (!user.tocologist || user.tocologist._id.toString() !== id) {
      throw new ForbiddenException('Action is forbidden');
    }

    const updated = await this.dbService.saveImage(id, image);
    return apiUpdated('Tocologist Updated', updated);
  }
}
