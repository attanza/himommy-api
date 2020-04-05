import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloodPressureController } from './controllers/blood-pressure.controller';
import { WeightController } from './controllers/weight.controller';
import { MommyDetailSchema } from './mommy-detail.schema';
import { MommyDetailService } from './mommy-detail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MommyDetail',
        schema: MommyDetailSchema,
        collection: 'mommy_details',
      },
    ]),
  ],
  providers: [MommyDetailService],
  controllers: [WeightController, BloodPressureController],
  exports: [MommyDetailService],
})
export class MommyDetailModule {}
