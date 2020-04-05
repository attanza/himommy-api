import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeightController } from './controllers/mommy-detail.controller';
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
  controllers: [WeightController],
  exports: [MommyDetailService],
})
export class MommyDetailModule {}
