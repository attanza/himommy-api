import { Module } from '@nestjs/common';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

@Module({
  imports: [RoleModule, PermissionModule],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
