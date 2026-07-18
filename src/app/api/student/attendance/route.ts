import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error, badRequest } from "@/lib/api-utils";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const now = new Date();
    const m = month ? parseInt(month) - 1 : now.getMonth();
    const y = year ? parseInt(year) : now.getFullYear();

    const records = await Attendance.find({
      studentId: user.id,
      date: {
        $gte: new Date(y, m, 1),
        $lte: new Date(y, m + 1, 0, 23, 59, 59),
      },
    }).sort({ date: -1 }).lean();

    const totalPresent = records.filter((r) => r.status === "present").length;
    const totalLate = records.filter((r) => r.status === "late").length;
    const totalAbsent = records.filter((r) => r.status === "absent").length;
    const totalLeave = records.filter((r) => r.status === "leave").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = records.find((r) => {
      const rd = new Date(r.date);
      rd.setHours(0, 0, 0, 0);
      return rd.getTime() === today.getTime();
    });

    return success({
      records,
      stats: {
        totalPresent,
        totalLate,
        totalAbsent,
        totalLeave,
        totalDays: records.length,
      },
      todayRecord: todayRecord || null,
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch attendance");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await Attendance.findOne({ studentId: user.id, date: today });
    if (existing) {
      return badRequest("Attendance already marked for today");
    }

    const hours = now.getHours();
    let status: "present" | "late" = "present";
    if (hours >= 10) status = "late";

    const checkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const record = await Attendance.create({
      studentId: user.id,
      date: today,
      status,
      checkInTime,
      notes: body.notes || "",
    });

    return success(record, status === "late" ? "Attendance marked (Late)" : "Attendance marked (Present)");
  } catch (err: any) {
    return error(err.message || "Failed to mark attendance");
  }
}
