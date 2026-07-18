import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  featuredImage?: string;
  targetAudience: "all" | "morning" | "evening" | "full_day" | "specific";
  isActive: boolean;
  notifyStudents: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: Date, required: true },
    startTime: String,
    endTime: String,
    location: String,
    featuredImage: String,
    targetAudience: { type: String, enum: ["all", "morning", "evening", "full_day", "specific"], default: "all" },
    isActive: { type: Boolean, default: true },
    notifyStudents: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EventSchema.index({ eventDate: 1 });
EventSchema.index({ isActive: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
