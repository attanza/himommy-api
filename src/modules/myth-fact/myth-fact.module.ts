import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MythFactController } from './controllers/myth-fact.controller';
import { MythFactSchema } from './myth-fact.schema';
import { MythFactService } from './myth-fact.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MythFact', schema: MythFactSchema, collection: 'myth_facts' },
    ]),
  ],
  providers: [MythFactService],
  controllers: [MythFactController],
})
export class MythFactModule {}
