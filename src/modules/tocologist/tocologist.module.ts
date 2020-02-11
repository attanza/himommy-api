import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileTocologistController } from './controllers/mobile-tocologist.controller';
import { TocologistController } from './controllers/tocologist.controller';
import { TocologistSchema } from './tocologist.schema';
import { TocologistService } from './tocologist.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tocologist', schema: TocologistSchema },
    ]),
    TocologistServicesModule,
  ],
  controllers: [TocologistController, MobileTocologistController],
  providers: [TocologistService],
  exports: [TocologistService],
})
export class TocologistModule {}
