import mongoose, { Schema, Document } from "mongoose";

export interface ISeatAssignment extends Document {
  seatId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  shiftType: "full_day" | "morning" | "evening";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  assignedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SeatAssignmentSchema = new Schema<ISeatAssignment>(
  {
    seatId: { type: Schema.Types.ObjectId, ref: "Seat", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shiftType: { type: String, enum: ["full_day", "morning", "evening"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { timestamps: true }
);

SeatAssignmentSchema.index({ seatId: 1, isActive: 1 });
SeatAssignmentSchema.index({ studentId: 1, isActive: 1 });
SeatAssignmentSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.SeatAssignment || mongoose.model<ISeatAssignment>("SeatAssignment", SeatAssignmentSchema);
