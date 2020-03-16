import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BabySchema } from './baby.schema';
import { BabyService } from './baby.service';
import { BabyController } from './controllers/baby.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Baby', schema: BabySchema, collection: 'babies' },
    ]),
    UserModule,
  ],
  providers: [BabyService],
  controllers: [BabyController],
})
export class BabyModule {}
