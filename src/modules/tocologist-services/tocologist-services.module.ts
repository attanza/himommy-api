import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TocologistServicesController } from './tocologist-services.controller';
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
  controllers: [TocologistServicesController],
  providers: [TocologistServicesService],
  exports: [TocologistServicesService],
})
export class TocologistServicesModule {}
