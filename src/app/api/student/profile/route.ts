import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import StudentProfile from "@/models/StudentProfile";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const profile = await StudentProfile.findOne({ userId: user.id }).lean();
    const membership = await Membership.findOne({ studentId: user.id, status: "active" })
      .populate("planId", "name shiftType startTime endTime monthlyFee")
      .populate("seatId", "seatNumber")
      .lean();

    const recentPayments = await Payment.find({ studentId: user.id })
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const attendanceThisMonth = await Attendance.countDocuments({
      studentId: user.id,
      date: { $gte: startOfMonth },
      status: "present",
    });
    const totalDaysInMonth = today.getDate();
    const attendancePercentage = totalDaysInMonth > 0 ? Math.round((attendanceThisMonth / totalDaysInMonth) * 100) : 0;

    return success({
      user,
      profile,
      membership,
      recentPayments,
      attendanceStats: {
        presentDays: attendanceThisMonth,
        totalDays: totalDaysInMonth,
        percentage: attendancePercentage,
      },
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch profile");
  }
}
