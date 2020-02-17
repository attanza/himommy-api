import { CheckListModule } from '@modules/check-list/check-list.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MommyCheckListController } from './controllers/mommy-check-list.controller';
import { MommyCheckListSchema } from './mommy-check-list.schema';
import { MommyCheckListService } from './mommy-check-list.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MommyCheckList',
        schema: MommyCheckListSchema,
        collection: 'mommy_check_lists',
      },
    ]),
    CheckListModule,
  ],
  controllers: [MommyCheckListController],
  providers: [MommyCheckListService],
  exports: [MommyCheckListService],
})
export class MommyCheckListModule {}
