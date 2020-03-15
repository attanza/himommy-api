import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobilePregnancyAgesController } from './controllers/mobile-pregnancy-ages.controller';
import { PregnancyAgesController } from './controllers/pregnancy-ages.controller';
import { PregnancyAgesSchema } from './pregnancy-ages.schema';
import { PregnancyAgesService } from './pregnancy-ages.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'PregnancyAges',
        schema: PregnancyAgesSchema,
        collection: 'pregnancy_ages',
      },
    ]),
  ],
  controllers: [PregnancyAgesController, MobilePregnancyAgesController],
  providers: [PregnancyAgesService],
})
export class PregnancyAgesModule {}
