import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  displayPassword?: string;
  role: "owner" | "staff" | "student";
  phone: string;
  isActive: boolean;
  lastLogin?: Date;
  authProvider?: "credentials" | "google";
  staffPermissions?: {
    canMarkAttendance: boolean;
    canAddStudents: boolean;
    canCollectFees: boolean;
    canViewSeats: boolean;
    canSendNotifications: boolean;
    canViewReports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    displayPassword: { type: String, select: false },
    role: { type: String, enum: ["owner", "staff", "student"], required: true },
    phone: { type: String, required: false, default: "" },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    staffPermissions: {
      canMarkAttendance: { type: Boolean, default: false },
      canAddStudents: { type: Boolean, default: false },
      canCollectFees: { type: Boolean, default: false },
      canViewSeats: { type: Boolean, default: true },
      canSendNotifications: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
