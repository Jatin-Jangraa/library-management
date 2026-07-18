import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  amount: number;
  discount: number;
  finalAmount: number;
  method: "online" | "cash" | "bank_transfer" | "upi" | "cheque" | "other";
  purpose: "admission" | "monthly_fee" | "renewal" | "security_deposit" | "late_fee" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptNumber: string;
  paymentDate: Date;
  notes?: string;
  receivedBy?: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership" },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan" },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["online", "cash", "bank_transfer", "upi", "cheque", "other"], required: true },
    purpose: { type: String, enum: ["admission", "monthly_fee", "renewal", "security_deposit", "late_fee", "other"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    receiptNumber: { type: String, required: true, unique: true },
    paymentDate: { type: Date, default: Date.now },
    notes: String,
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1 });
PaymentSchema.index({ receiptNumber: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentDate: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
