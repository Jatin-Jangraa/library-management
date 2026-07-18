import mongoose, { Schema, Document } from "mongoose";

export interface IFacility extends Document {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true },
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Facility || mongoose.model<IFacility>("Facility", FacilitySchema);
