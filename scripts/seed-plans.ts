import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/library_management";

const plans = [
  {
    name: "Monthly Full Day",
    description: "Full day access to the library with all facilities for one month.",
    shiftType: "full_day",
    monthlyFee: 1500,
    admissionFee: 500,
    securityDeposit: 1000,
    duration: 1,
    durationUnit: "months",
    gracePeriod: 3,
    lateFee: 50,
    facilities: ["WiFi", "AC", "Parking", "Locker", "Drinking Water", "Power Outlets"],
    isActive: true,
  },
  {
    name: "Monthly Morning",
    description: "Morning shift access (8 AM – 2 PM) for students who prefer daytime study.",
    shiftType: "morning",
    startTime: "08:00",
    endTime: "14:00",
    monthlyFee: 1000,
    admissionFee: 300,
    securityDeposit: 800,
    duration: 1,
    durationUnit: "months",
    gracePeriod: 3,
    lateFee: 30,
    facilities: ["WiFi", "AC", "Drinking Water", "Power Outlets"],
    isActive: true,
  },
  {
    name: "Monthly Evening",
    description: "Evening shift access (4 PM – 10 PM) for working students.",
    shiftType: "evening",
    startTime: "16:00",
    endTime: "22:00",
    monthlyFee: 1200,
    admissionFee: 300,
    securityDeposit: 800,
    duration: 1,
    durationUnit: "months",
    gracePeriod: 3,
    lateFee: 30,
    facilities: ["WiFi", "AC", "Drinking Water", "Power Outlets"],
    isActive: true,
  },
];

async function seed() {
  const conn = await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const Plan = conn.model(
    "MembershipPlan",
    new mongoose.Schema(
      {
        name: { type: String, required: true },
        description: String,
        shiftType: { type: String, enum: ["full_day", "morning", "evening", "custom"], required: true },
        startTime: String,
        endTime: String,
        monthlyFee: { type: Number, required: true, min: 0 },
        admissionFee: { type: Number, default: 0, min: 0 },
        securityDeposit: { type: Number, default: 0, min: 0 },
        duration: { type: Number, required: true, min: 1 },
        durationUnit: { type: String, enum: ["days", "weeks", "months"], default: "months" },
        gracePeriod: { type: Number, default: 0 },
        lateFee: { type: Number, default: 0 },
        facilities: [String],
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true }
    )
  );

  const existing = await Plan.countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} existing plans. Skipping seed.`);
    console.log("To re-seed, delete existing plans from the admin panel first.");
    await conn.disconnect();
    return;
  }

  const result = await Plan.insertMany(plans);
  console.log(`Inserted ${result.length} plans:`);
  result.forEach((p: any) => console.log(`  - ${p.name} | ₹${p.monthlyFee}/mo | ${p.shiftType}`));

  await conn.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
