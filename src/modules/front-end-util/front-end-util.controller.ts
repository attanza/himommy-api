import { EArticleCategory } from '@modules/article/article.interface';
import { ECheckListCategory } from '@modules/check-list/check-list.interface';
import { Redis } from '@modules/helpers/redis';
import { apiItem } from '@modules/helpers/responseParser';
import { Controller, Get, Logger } from '@nestjs/common';
import { EPlatform } from '../app-version/app-version.interface';
@Controller('/admin/front-end-utils')
export class FrontEndUtilController {
  @Get('enums')
  async getEnums() {
    const redisKey = 'FrontEndUtils_ENUMS';
    const cache = await Redis.get(redisKey);
    if (cache != null) {
      Logger.log('Enum from cache');
      return apiItem('Enum List', JSON.parse(cache));
    }
    const enums = {
      platforms: Object.values(EPlatform),
      articleCategories: Object.values(EArticleCategory),
      checkListCategories: Object.values(ECheckListCategory),
    };
    await Redis.set(redisKey, JSON.stringify(enums));
    return apiItem('Enum List', enums);
  }
}
