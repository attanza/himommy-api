import { Document } from 'mongoose';

export interface IAuditTrail extends Document {
  user: string;
  auditableId: string;
  auditableType: string;
  action: EAuditTrailAction;
  dataBefore: String;
  dataAfter: String;
  detail: string;
  ip: string;
  browser: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum EAuditTrailAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
