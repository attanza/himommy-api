import { apiItem } from '@/modules/helpers/responseParser';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { Controller, Get, Query } from '@nestjs/common';
import { EPlatform } from '../app-version.interface';
import { AppVersionService } from '../app-version.service';

@Controller('mobile/app-version')
export class MobileAppVersionController {
  modelName = 'AppVersion';
  constructor(private dbService: AppVersionService) {}

  @Get()
  async all(@Query('platform') platform: EPlatform): Promise<IApiItem> {
    const data = await this.dbService.getByPlatform(platform);
    return apiItem('App Version', data);
  }
}
