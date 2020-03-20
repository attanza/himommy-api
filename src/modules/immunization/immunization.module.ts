import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImmunizationController } from './controllers/immunization.controller';
import { MobileImmunizationController } from './controllers/mobile-immunization.controller';
import { ImmunizationSchema } from './immunization.schema';
import { ImmunizationService } from './immunization.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Immunization',
        schema: ImmunizationSchema,
        collection: 'immunizations',
      },
    ]),
  ],
  providers: [ImmunizationService],
  controllers: [ImmunizationController, MobileImmunizationController],
  exports: [ImmunizationService],
})
export class ImmunizationModule {}
