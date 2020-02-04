import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TocologistController } from './tocologist.controller';
import { TocologistSchema } from './tocologist.schema';
import { TocologistService } from './tocologist.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tocologist', schema: TocologistSchema },
    ]),
    TocologistServicesModule,
  ],
  controllers: [TocologistController],
  providers: [TocologistService],
})
export class TocologistModule {}
