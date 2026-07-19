import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "fee_reminder" | "payment_confirmation" | "membership_expiry" | "holiday_notice" | "timing_change" | "event_announcement" | "maintenance_notice" | "emergency_notice" | "general";
  targetAudience: "all" | "morning" | "evening" | "full_day" | "specific" | "expired";
  specificStudentIds: mongoose.Types.ObjectId[];
  sentBy: mongoose.Types.ObjectId;
  sendEmail: boolean;
  emailSent: boolean;
  recipients: {
    studentId: mongoose.Types.ObjectId;
    read: boolean;
    readAt?: Date;
    delivered: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["fee_reminder", "payment_confirmation", "membership_expiry", "holiday_notice", "timing_change", "event_announcement", "maintenance_notice", "emergency_notice", "general"], required: true },
    targetAudience: { type: String, enum: ["all", "morning", "evening", "full_day", "specific", "expired"], required: true },
    specificStudentIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sendEmail: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    recipients: [{
      studentId: { type: Schema.Types.ObjectId, ref: "User" },
      read: { type: Boolean, default: false },
      readAt: Date,
      delivered: { type: Boolean, default: true },
    }],
  },
  { timestamps: true }
);

NotificationSchema.index({ "recipients.studentId": 1, "recipients.read": 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
