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
  const conn = await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const UserSchema = new mongoose.Schema(
    {
      name: String,
      email: String,
      password: String,
      displayPassword: String,
      role: String,
      phone: String,
      isActive: Boolean,
    },
    { timestamps: true }
  );

  const User = conn.models.User || conn.model("User", UserSchema);

  const adminEmail = "admin@library.com";
  const adminPassword = generatePassword();

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      displayPassword: adminPassword,
      role: "owner",
      phone: "9999999999",
      isActive: true,
    });
    console.log("Admin created!");
  }

  console.log("\n--- Admin Login Credentials ---");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log("-------------------------------\n");

  await conn.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
