import { apiItem } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { Controller, Get, Query } from '@nestjs/common';
import { AppVersionService } from '../app-version.service';

@Controller('tocologist/app-version')
export class TocologistAppVersionController {
  modelName = 'AppVersion';
  constructor(private dbService: AppVersionService) {}

  @Get()
  async all(@Query('platform') platform: string): Promise<IApiItem> {
    const data = await this.dbService.getByPlatform(platform);
    return apiItem('App Version', data);
  }
}
