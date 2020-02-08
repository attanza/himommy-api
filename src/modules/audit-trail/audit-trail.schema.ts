import * as mongoose from 'mongoose';
export const AuditTrailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    auditableId: String,
    auditableType: String,
    action: String,
    detail: String,
    ip: String,
    browser: String,
  },
  { timestamps: true },
);
AuditTrailSchema.index({
  action: 1,
  auditableId: 1,
  auditableType: 1,
  user: 1,
});
