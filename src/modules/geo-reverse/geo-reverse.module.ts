import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeoReverseController } from './controllers/geo-reverse.controller';
import { MobileGeoReverseController } from './controllers/mobile-geo-reverse.controller';
import { GeoReverseSchema } from './geo-reverse.schema';
import { GeoReverseService } from './geo-reverse.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'GeoReverse',
        schema: GeoReverseSchema,
        collection: 'geo_reverses',
      },
    ]),
  ],
  controllers: [GeoReverseController, MobileGeoReverseController],
  providers: [GeoReverseService],
  exports: [GeoReverseService],
})
export class GeoReverseModule {}
