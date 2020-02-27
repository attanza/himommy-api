import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileReasonController } from './controllers/mobile-reason.controller';
import { ReasonController } from './controllers/reason.controller';
import { TocologistReasonController } from './controllers/tocologist-reason.controller';
import { ReasonSchema } from './reason.schema';
import { ReasonService } from './Reason.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Reason', schema: ReasonSchema }]),
  ],
  controllers: [
    ReasonController,
    MobileReasonController,
    TocologistReasonController,
  ],
  providers: [ReasonService],
})
export class ReasonModule {}
