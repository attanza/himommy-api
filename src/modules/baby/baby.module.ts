import { CheckListModule } from '@modules/check-list/check-list.module';
import { ImmunizationModule } from '@modules/immunization/immunization.module';
import { QueueModule } from '@modules/queue/queue.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BabySchema } from './baby.schema';
import { BabyService } from './baby.service';
import { BabyController } from './controllers/baby.controller';
import { MobileBabyController } from './controllers/mobile-baby.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Baby', schema: BabySchema, collection: 'babies' },
    ]),
    UserModule,
    ImmunizationModule,
    QueueModule,
    CheckListModule,
  ],
  providers: [BabyService],
  controllers: [BabyController, MobileBabyController],
})
export class BabyModule {}
