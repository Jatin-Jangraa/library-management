import mongoose, { Schema, Document } from "mongoose";

export interface IMembershipPlan extends Document {
  name: string;
  description?: string;
  shiftType: "full_day" | "morning" | "evening" | "custom";
  startTime?: string;
  endTime?: string;
  monthlyFee: number;
  securityDeposit: number;
  duration: number;
  durationUnit: "days" | "weeks" | "months";
  facilities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true },
    description: String,
    shiftType: { type: String, enum: ["full_day", "morning", "evening", "custom"], required: true },
    startTime: String,
    endTime: String,
    monthlyFee: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    durationUnit: { type: String, enum: ["days", "weeks", "months"], default: "months" },
    facilities: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.MembershipPlan || mongoose.model<IMembershipPlan>("MembershipPlan", MembershipPlanSchema);
