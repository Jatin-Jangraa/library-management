import mongoose, { Schema, Document } from "mongoose";

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  fatherName?: string;
  alternatePhone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  course?: string;
  emergencyContact?: string;
  idProofType?: "aadhar" | "pan" | "passport" | "student_id" | "other";
  idProofNumber?: string;
  photo?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: String, required: true, unique: true },
    fatherName: String,
    alternatePhone: String,
    address: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    course: String,
    emergencyContact: String,
    idProofType: { type: String, enum: ["aadhar", "pan", "passport", "student_id", "other"] },
    idProofNumber: String,
    photo: String,
    notes: String,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StudentProfileSchema.index({ userId: 1 });
StudentProfileSchema.index({ studentId: 1 });

export default mongoose.models.StudentProfile || mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
