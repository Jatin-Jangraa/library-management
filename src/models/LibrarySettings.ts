import mongoose, { Schema, Document } from "mongoose";

export interface ILibrarySettings extends Document {
  libraryName: string;
  logo?: string;
  heroHeading?: string;
  heroDescription?: string;
  aboutContent?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  googleMapsUrl?: string;
  whatsappNumber?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  receiptPrefix: string;
  studentIdPrefix: string;
  libraryTimings: {
    openTime: string;
    closeTime: string;
    openDays: string[];
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seatSharingEnabled: boolean;
  lateFeeEnabled: boolean;
  lateFeeAmount: number;
  membershipExpiryGraceDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const LibrarySettingsSchema = new Schema<ILibrarySettings>(
  {
    libraryName: { type: String, default: process.env.NEXT_PUBLIC_LIBRARY_NAME || "Study Library" },
    logo: String,
    heroHeading: { type: String, default: process.env.NEXT_PUBLIC_HERO_HEADING || "Your Dedicated Study Space" },
    heroDescription: { type: String, default: process.env.NEXT_PUBLIC_HERO_DESCRIPTION || "A quiet, comfortable, and well-equipped study library for serious students." },
    aboutContent: String,
    contactPhone: { type: String, default: process.env.NEXT_PUBLIC_CONTACT_PHONE },
    contactEmail: { type: String, default: process.env.NEXT_PUBLIC_CONTACT_EMAIL },
    address: { type: String, default: process.env.NEXT_PUBLIC_ADDRESS },
    googleMapsUrl: String,
    whatsappNumber: { type: String, default: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER },
    currency: { type: String, default: process.env.NEXT_PUBLIC_CURRENCY || "INR" },
    timezone: { type: String, default: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Kolkata" },
    dateFormat: { type: String, default: process.env.NEXT_PUBLIC_DATE_FORMAT || "DD/MM/YYYY" },
    receiptPrefix: { type: String, default: process.env.NEXT_PUBLIC_RECEIPT_PREFIX || "RCP" },
    studentIdPrefix: { type: String, default: process.env.NEXT_PUBLIC_STUDENT_ID_PREFIX || "LIB" },
    libraryTimings: {
      openTime: { type: String, default: "06:00" },
      closeTime: { type: String, default: "22:00" },
      openDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    seatSharingEnabled: { type: Boolean, default: false },
    lateFeeEnabled: { type: Boolean, default: false },
    lateFeeAmount: { type: Number, default: 0 },
    membershipExpiryGraceDays: { type: Number, default: 7 },
  },
  { timestamps: true }
);

export default mongoose.models.LibrarySettings || mongoose.model<ILibrarySettings>("LibrarySettings", LibrarySettingsSchema);
