import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckListSchema } from './check-list.schema';
import { CheckListService } from './check-list.service';
import { CheckListController } from './controllers/check-list.controller';
import { MobileCheckListController } from './controllers/mobile-check-list.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'CheckList', schema: CheckListSchema }]),
  ],
  controllers: [CheckListController, MobileCheckListController],
  providers: [CheckListService],
  exports: [CheckListService],
})
export class CheckListModule {}
