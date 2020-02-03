import {
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '@modules/helpers/responseParser';
import {
  IApiCollection,
  IApiItem,
} from '@modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
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
import { CreateAppVersionDto, UpdateAppVersionDto } from './app-version.dto';
import { AppVersionService } from './app-version.service';

@Controller('admin/app-versions')
@UseGuards(AuthGuard('jwt'))
export class AppVersionController {
  modelName = 'AppVersion';
  constructor(private dbService: AppVersionService) {}

  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['platform'];
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
    const data = await this.dbService.show(this.modelName, id);
    return apiItem(this.modelName, data);
  }

  @Post()
  async store(
    @Body(new ValidationPipe()) createDto: CreateAppVersionDto,
  ): Promise<IApiItem> {
    const data = await this.dbService.store(createDto);
    return apiCreated(this.modelName, data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateAppVersionDto,
  ): Promise<IApiItem> {
    const { id } = param;
    const data = await this.dbService.update(this.modelName, id, updateDto);
    return apiUpdated(this.modelName, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    await this.dbService.destroy(this.modelName, id);
    return apiDeleted(this.modelName);
  }
}
