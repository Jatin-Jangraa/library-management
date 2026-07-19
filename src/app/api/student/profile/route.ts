import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import StudentProfile from "@/models/StudentProfile";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";
import Seat from "@/models/Seat";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const profile = await StudentProfile.findOne({ userId: user.id }).lean();
    const membership = await Membership.findOne({ studentId: user.id, status: "active" })
      .populate("planId", "name shiftType startTime endTime monthlyFee securityDeposit duration durationUnit")
      .populate("seatId", "seatNumber")
      .lean();

    const recentPayments = await Payment.find({ studentId: user.id })
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const attendanceRecords = await Attendance.find({
      studentId: user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();

    const totalPresent = attendanceRecords.filter((r) => r.status === "present").length;
    const totalLate = attendanceRecords.filter((r) => r.status === "late").length;
    const totalAbsent = attendanceRecords.filter((r) => r.status === "absent").length;
    const totalLeave = attendanceRecords.filter((r) => r.status === "leave").length;
    const totalMarked = attendanceRecords.length;

    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayRecord = attendanceRecords.find((r) => {
      const rd = new Date(r.date);
      rd.setHours(0, 0, 0, 0);
      return rd.getTime() === todayDate.getTime();
    }) || null;

    return success({
      user,
      profile,
      membership,
      recentPayments,
      attendance: {
        records: attendanceRecords,
        todayRecord,
        stats: {
          present: totalPresent,
          late: totalLate,
          absent: totalAbsent,
          leave: totalLeave,
          total: totalMarked,
        },
      },
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch profile");
  }
}
