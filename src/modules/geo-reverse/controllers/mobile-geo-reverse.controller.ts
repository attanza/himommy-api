import { Role } from '@/guards/role.decorator';
import { RoleGuard } from '@/guards/role.guard';
import { apiItem } from '@/modules/helpers/responseParser';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { GeoReverseQueryPipe } from '@/modules/shared/pipes/geo-reverse-query.pipe';
import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GeoReverseService } from '../geo-reverse.service';

@Controller('mobile/geo-reverse')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MobileGeoReverseController {
  modelName = 'GeoReverse';
  constructor(private dbService: GeoReverseService) {}

  @Get()
  @Role('mommy')
  @UsePipes(ValidationPipe)
  async getGeoReverse(@Query() query: GeoReverseQueryPipe): Promise<IApiItem> {
    const { lat, lon } = query;
    const data = await this.dbService.getAddressFromLatLong(lat, lon);
    return apiItem('GeoReverse', data);
  }
}
