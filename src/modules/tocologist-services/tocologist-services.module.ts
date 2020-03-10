import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TocologistServicesController } from './controllers/tocologist-services.controller';
import { TocologistTocologistServicesController } from './controllers/tocologist-tocologist-services.controller';
import { TocologistServiceSchema } from './tocologist-services.schema';
import { TocologistServicesService } from './tocologist-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'TocologistService',
        schema: TocologistServiceSchema,
        collection: 'tocologist_services',
      },
    ]),
  ],
  controllers: [
    TocologistServicesController,
    TocologistTocologistServicesController,
  ],
  providers: [TocologistServicesService],
  exports: [TocologistServicesService],
})
export class TocologistServicesModule {}
