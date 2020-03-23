import { QueueModule } from '@modules/queue/queue.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileMythFactController } from './controllers/mobile-myth-fact.controller';
import { MythFactController } from './controllers/myth-fact.controller';
import { MythFactSchema } from './myth-fact.schema';
import { MythFactService } from './myth-fact.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MythFact', schema: MythFactSchema, collection: 'myth_facts' },
    ]),
    QueueModule,
  ],
  providers: [MythFactService],
  controllers: [MythFactController, MobileMythFactController],
})
export class MythFactModule {}
