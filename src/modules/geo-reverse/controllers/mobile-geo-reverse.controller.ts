import { apiItem } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { GeoReverseQueryPipe } from '@modules/shared/pipes/geo-reverse-query.pipe';
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GeoReverseService } from '../geo-reverse.service';

@Controller('mobile/geo-reverse')
export class MobileGeoReverseController {
  modelName = 'GeoReverse';
  constructor(private dbService: GeoReverseService) {}

  @Get()
  @UsePipes(ValidationPipe)
  async getGeoReverse(@Query() query: GeoReverseQueryPipe): Promise<IApiItem> {
    const { lat, lon } = query;
    const data = await this.dbService.getAddressFromLatLong(lat, lon);
    return apiItem('GeoReverse', data);
  }
}
