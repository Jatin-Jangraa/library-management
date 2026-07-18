import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  alternatePhone: z.string().optional(),
  fatherName: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  course: z.string().optional(),
  emergencyContact: z.string().optional(),
  idProofType: z.enum(["aadhar", "pan", "passport", "student_id", "other"]).optional(),
  idProofNumber: z.string().optional(),
  photo: z.string().optional(),
  notes: z.string().optional(),
});

export const planSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  shiftType: z.enum(["full_day", "morning", "evening", "custom"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  monthlyFee: z.number().min(0, "Fee must be positive"),
  admissionFee: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
  duration: z.number().min(1, "Duration is required"),
  durationUnit: z.enum(["days", "weeks", "months"]),
  gracePeriod: z.number().min(0).optional(),
  lateFee: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const seatSchema = z.object({
  seatNumber: z.string().min(1, "Seat number is required"),
  floor: z.string().optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(["available", "occupied", "reserved", "maintenance", "disabled"]).default("available"),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  amount: z.number().min(1, "Amount must be positive"),
  method: z.enum(["online", "cash", "bank_transfer", "upi", "cheque", "other"]),
  purpose: z.enum(["admission", "monthly_fee", "renewal", "security_deposit", "late_fee", "other"]),
  planId: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().min(0).optional(),
});

export const offlinePaymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().min(1),
  method: z.enum(["cash", "bank_transfer", "upi", "cheque", "other"]),
  purpose: z.enum(["admission", "monthly_fee", "renewal", "security_deposit", "late_fee", "other"]),
  planId: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().min(0).optional(),
  paymentDate: z.string().optional(),
});

export const attendanceSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["present", "absent", "late", "half_day", "leave"]),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  notes: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().min(1),
  records: z.array(z.object({
    studentId: z.string(),
    status: z.enum(["present", "absent", "late", "half_day", "leave"]),
  })),
});

export const expenseSchema = z.object({
  date: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0),
  paymentMethod: z.string().min(1),
  description: z.string().min(1),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  eventDate: z.string().min(1),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  targetAudience: z.enum(["all", "morning", "evening", "full_day", "specific"]),
  isActive: z.boolean().default(true),
});

export const notificationSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(10),
  type: z.enum(["fee_reminder", "payment_confirmation", "admission_confirmation", "membership_expiry", "holiday_notice", "timing_change", "event_announcement", "maintenance_notice", "emergency_notice", "general"]),
  targetAudience: z.enum(["all", "morning", "evening", "full_day", "specific", "pending_fees", "expired"]),
  specificStudentIds: z.array(z.string()).optional(),
  sendEmail: z.boolean().default(false),
});

export const supportTicketSchema = z.object({
  category: z.enum(["seat_problem", "wifi_issue", "electricity", "cleanliness", "payment_issue", "membership_issue", "change_seat", "change_shift", "other"]),
  subject: z.string().min(2),
  description: z.string().min(10),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const facilitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(2),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().default(true),
});

export const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

export const staffPermissionSchema = z.object({
  canMarkAttendance: z.boolean().default(false),
  canAddStudents: z.boolean().default(false),
  canCollectFees: z.boolean().default(false),
  canViewSeats: z.boolean().default(true),
  canSendNotifications: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
});

export const settingsSchema = z.object({
  libraryName: z.string().min(1).optional(),
  logo: z.string().optional(),
  heroHeading: z.string().optional(),
  heroDescription: z.string().optional(),
  aboutContent: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  whatsappNumber: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  receiptPrefix: z.string().optional(),
  studentIdPrefix: z.string().optional(),
  libraryTimings: z.object({
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    openDays: z.array(z.string()).optional(),
  }).optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  seatSharingEnabled: z.boolean().optional(),
  lateFeeEnabled: z.boolean().optional(),
  lateFeeAmount: z.number().optional(),
  membershipExpiryGraceDays: z.number().optional(),
});
