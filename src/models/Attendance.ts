import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "half_day" | "leave";
  checkInTime?: string;
  checkOutTime?: string;
  markedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "late", "half_day", "leave"], required: true },
    checkInTime: String,
    checkOutTime: String,
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
