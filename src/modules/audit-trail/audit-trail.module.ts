import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditTrailSchema } from './audit-trail.schema';
import { AuditTrailService } from './audit-trail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AuditTrail',
        schema: AuditTrailSchema,
        collection: 'audit_trails',
      },
    ]),
  ],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
