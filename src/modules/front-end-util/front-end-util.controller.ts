import { EArticleCategory } from '@modules/article/article.interface';
import { apiItem } from '@modules/helpers/responseParser';
import { Controller, Get } from '@nestjs/common';
import { EPlatform } from '../app-version/app-version.interface';
@Controller('front-end-utils')
export class FrontEndUtilController {
  @Get('enums')
  async getEnums() {
    const platforms: EPlatform[] = [
      EPlatform.ANDROID_MOMMY,
      EPlatform.ANDROID_TOCOLOGIST,
      EPlatform.DASHBOARD,
      EPlatform.IOS_MOMMY,
      EPlatform.IOS_TOCOLOGIST,
    ];
    const articleCategories: EArticleCategory[] = [
      EArticleCategory.ARTICLES,
      EArticleCategory.MYTHS,
      EArticleCategory.TIPS,
    ];
    return apiItem('Enum List', { platforms, articleCategories });
  }
}
