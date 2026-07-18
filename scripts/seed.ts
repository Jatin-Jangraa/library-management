import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/library_management";

function generatePassword(length: number = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const Users = db.collection("users");

  const adminEmail = "admin@library.com";
  const existing = await Users.findOne({ email: adminEmail });

  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    console.log("\n=== Seed Complete (admin already existed) ===");
    await mongoose.disconnect();
    return;
  }

  const adminPassword = generatePassword();
  const hashed = await bcrypt.hash(adminPassword, 12);

  await Users.insertOne({
    name: "Admin",
    email: adminEmail,
    password: hashed,
    displayPassword: adminPassword,
    role: "owner",
    phone: "9999999999",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin created!");
  console.log("\n=== Admin Login Credentials ===");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log("================================\n");
  console.log("Add plans, facilities, testimonials, and other data through the admin panel.");

  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seed error:", err); process.exit(1); });
