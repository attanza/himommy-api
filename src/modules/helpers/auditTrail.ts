import { IAuditTrail } from '@modules/audit-trail/audit-trail.interface';
import { AuditTrailService } from '@modules/audit-trail/audit-trail.service';

export class AuditTrailHelper {
  constructor(private auditTrailService: AuditTrailService) {}

  async save(auditData: IAuditTrail) {
    return await this.auditTrailService.dbStore('AuditTrail', auditData);
  }
}
