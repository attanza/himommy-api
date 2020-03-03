import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionController } from './permission.controller';
import { PermissionResolver } from './permission.resolver';
import { PermissionSchema } from './permission.schema';
import { PermissionService } from './permission.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Permission', schema: PermissionSchema },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionResolver, PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
