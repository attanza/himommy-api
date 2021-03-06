import { GetUser } from '@/modules/shared/decorators/get-user.decorator';
import {
  IApiCollection,
  IApiItem,
} from '@/modules/shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
import { IUser } from '@/modules/user/user.interface';
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from '../question.service';

@Controller('mobile/questions')
@UseGuards(AuthGuard('jwt'))
export class MobileQuestionController {
  modelName = 'Question';
  constructor(private dbService: QuestionService) {}

  @Get()
  async all(
    @GetUser() user: IUser,
    @Query() query: ResourcePaginationPipe
  ): Promise<IApiCollection> {
    const regexSearchable = ['question'];
    const keyValueSearchable = ['level'];
    let customOptions = { level: 1 };
    if (user.detail && user.detail.currentQuestionLevel) {
      customOptions = { level: user.detail.currentQuestionLevel + 1 };
    }
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
      customOptions,
    });
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem> {
    const { id } = param;
    return await this.dbService.show({ modelName: this.modelName, id });
  }
}
