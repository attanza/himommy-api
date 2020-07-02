import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { IApiCollection } from '@/modules/shared/interfaces/response-parser.interface';
import { ResourcePaginationPipe } from '@/modules/shared/pipes/resource-pagination.pipe';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReasonService } from '../reason.service';

@Controller('tocologist/reasons')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class TocologistReasonController {
  modelName = 'Reason';
  constructor(private dbService: ReasonService) {}
  uniques = ['reason'];
  @Get()
  @Role('tocologist')
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
