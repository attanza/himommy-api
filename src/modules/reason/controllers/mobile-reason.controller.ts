import { IApiCollection } from '@/modules/shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReasonService } from '../reason.service';

@Controller('mobile/reasons')
@UseGuards(AuthGuard('jwt'))
export class MobileReasonController {
  modelName = 'Reason';
  constructor(private dbService: ReasonService) {}
  uniques = ['reason'];
  @Get()
  async all(@Query() query: ResourcePaginationPipe): Promise<IApiCollection> {
    const regexSearchable = ['reason'];
    const keyValueSearchable = ['category'];
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
      regexSearchable,
      keyValueSearchable,
    });
  }
}
