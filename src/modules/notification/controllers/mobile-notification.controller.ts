import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { apiDeleted } from '@/modules/helpers/responseParser';
import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import {
  IApiCollection,
  IApiItem,
} from '@/modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import { MongoIdsPipe } from '@/modules/shared/pipes/mongoIds.pipe';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@/modules/user/user.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../notification.service';

@Controller('mobile/notifications')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileNotificationController {
  modelName = 'Notification';
  constructor(private dbService: NotificationService) {}

  @Get()
  @Role('mommy')
  async all(
    @Query() query: ResourcePaginationPipe,
    @GetUser() user: IUser
  ): Promise<IApiCollection> {
    const regexSearchable = ['title'];
    const keyValueSearchable = ['isRead'];
    const customOptions = { user: user._id };
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
    @Param() param: MongoIdPipe,
    @GetUser() user: IUser
  ): Promise<IApiItem> {
    const { id } = param;
    let result: IApiItem;
    result = await this.dbService.show({ modelName: this.modelName, id });
    if (!result.data.isRead) {
      await this.dbService.updateIsRead(id, user._id);
    }
    return result;
  }

  @Delete()
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async bulkDestroy(
    @GetUser() user: IUser,
    @Body() body: MongoIdsPipe
  ): Promise<IApiItem> {
    const { ids } = body;
    await this.dbService.bulkDelete(ids, user._id);
    return apiDeleted('Notification');
  }

  @Delete(':id')
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.destroy({ modelName: this.modelName, id });
  }
}
