import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  floor?: string;
  description?: string;
  totalSeats: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    floor: String,
    description: String,
    totalSeats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
