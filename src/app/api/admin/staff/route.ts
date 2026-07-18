import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import User from "@/models/User";
import { generateRandomPassword } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const staff = await User.find({ role: "staff" }).select("-password").sort({ createdAt: -1 }).lean();
    return success(staff);
  } catch (err: any) {
    return error(err.message || "Failed to fetch staff");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return badRequest("Email already exists");

    const password = generateRandomPassword();
    const staff = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password,
      displayPassword: password,
      role: "staff",
      staffPermissions: body.permissions || {
        canMarkAttendance: false,
        canAddStudents: false,
        canCollectFees: false,
        canViewSeats: true,
        canSendNotifications: false,
        canViewReports: false,
      },
    });

    return success({ ...staff.toObject(), password: undefined, generatedPassword: password }, "Staff created");
  } catch (err: any) {
    return error(err.message || "Failed to create staff");
  }
}
