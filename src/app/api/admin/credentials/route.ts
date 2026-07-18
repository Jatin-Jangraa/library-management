import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

const SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "LIBADMIN2024";

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    if (body.key !== SECURITY_KEY) {
      return badRequest("Invalid security key");
    }

    const students = await User.find({ role: "student" })
      .select("name email displayPassword isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const profiles = await StudentProfile.find()
      .select("userId studentId")
      .lean();

    const profileMap = new Map<string, any>();
    profiles.forEach((p: any) => profileMap.set(p.userId.toString(), p));

    const credentials = students.map((s: any) => ({
      name: s.name,
      email: s.email,
      password: s.displayPassword || "N/A",
      studentId: profileMap.get(s._id.toString())?.studentId || "N/A",
      isActive: s.isActive,
    }));

    return success(credentials);
  } catch (err: any) {
    return error(err.message || "Failed to fetch credentials");
  }
}
