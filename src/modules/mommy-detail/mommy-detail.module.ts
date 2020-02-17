import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  exports: [MommyDetailService],
})
export class MommyDetailModule {}
