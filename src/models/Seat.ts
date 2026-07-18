import mongoose, { Schema, Document } from "mongoose";

export interface ISeat extends Document {
  seatNumber: string;
  floor?: string;
  features: string[];
  status: "available" | "occupied" | "reserved" | "maintenance" | "disabled";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    seatNumber: { type: String, required: true, unique: true },
    floor: String,
    features: [String],
    status: { type: String, enum: ["available", "occupied", "reserved", "maintenance", "disabled"], default: "available" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SeatSchema.index({ status: 1 });

export default mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);
