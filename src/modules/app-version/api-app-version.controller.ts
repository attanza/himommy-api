import { apiItem } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppVersionService } from './app-version.service';

@Controller('api/app-version')
@UseGuards(AuthGuard('jwt'))
export class ApiAppVersionController {
  modelName = 'AppVersion';
  constructor(private dbService: AppVersionService) {}

  @Get()
  async all(@Query('platform') platform: string): Promise<IApiItem> {
    const data = await this.dbService.getByPlatform(platform);
    return apiItem('App Version', data);
  }
}
