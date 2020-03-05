import { RoleModule } from '@modules/role/role.module';
import { Module } from '@nestjs/common';
import { ComboDataController } from './combo-data.controller';
import { ComboDataService } from './combo-data.service';

@Module({
  imports: [RoleModule],
  controllers: [ComboDataController],
  providers: [ComboDataService],
})
export class ComboDataModule {}
