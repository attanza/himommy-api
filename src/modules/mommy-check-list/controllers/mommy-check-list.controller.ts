import { CheckListService } from '@modules/check-list/check-list.service';
import { GetUser } from '@modules/shared/decorators/get-user.decorator';
import { IApiCollection } from '@modules/shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@modules/user/user.interface';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateMommyCheckListDto } from '../mommy-check-list.dto';
import { MommyCheckListService } from '../mommy-check-list.service';

@Controller('mobile/mommy-check-lists')
@UseGuards(AuthGuard('jwt'))
export class MommyCheckListController {
  modelName = 'Mommy Check List';
  constructor(
    private dbService: MommyCheckListService,

    private checkListService: CheckListService,
  ) {}

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection> {
    const regexSearchable = [];
    const keyValueSearchable = [];
    const customOptions = { user: user._id };
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      customOptions,
    });
  }

  @Post()
  async store(
    @GetUser() user: IUser,
    @Body(new ValidationPipe()) createDto: CreateMommyCheckListDto,
  ): Promise<any> {
    await this.checkListService.isCheckListsExists(createDto.checkLists);
    const { checkLists } = createDto;
    const result = await this.dbService.insertMany(user._id, checkLists);
    console.log('result', result);
    return result;
  }
}
