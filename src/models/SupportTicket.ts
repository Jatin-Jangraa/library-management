import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  ticketNumber: string;
  studentId: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse?: string;
  respondedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    adminResponse: String,
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { timestamps: true }
);

SupportTicketSchema.index({ studentId: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ ticketNumber: 1 });

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
