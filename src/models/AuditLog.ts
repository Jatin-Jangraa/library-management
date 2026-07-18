import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: Schema.Types.ObjectId,
    details: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ entity: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
