import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MommyDetailSchema } from './mommy-detail.schema';
import { MommyDetailService } from './mommy-detail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MommyDetail', schema: MommyDetailSchema },
    ]),
  ],
  providers: [MommyDetailService],
  exports: [MommyDetailService],
})
export class MommyDetailModule {}
