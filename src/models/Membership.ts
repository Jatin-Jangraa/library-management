import mongoose, { Schema, Document } from "mongoose";

export interface IMembership extends Document {
  studentId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  seatId?: mongoose.Types.ObjectId;
  shiftType: "full_day" | "morning" | "evening";
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "paused" | "cancelled";
  totalAmount: number;
  amountPaid: number;
  pendingAmount: number;
  securityDepositPaid: boolean;
  admissionFeePaid: boolean;
  assignedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    seatId: { type: Schema.Types.ObjectId, ref: "Seat" },
    shiftType: { type: String, enum: ["full_day", "morning", "evening"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired", "paused", "cancelled"], default: "active" },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    securityDepositPaid: { type: Boolean, default: false },
    admissionFeePaid: { type: Boolean, default: false },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { timestamps: true }
);

MembershipSchema.index({ studentId: 1 });
MembershipSchema.index({ status: 1 });
MembershipSchema.index({ endDate: 1 });
MembershipSchema.index({ studentId: 1, status: 1 });

export default mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema);
