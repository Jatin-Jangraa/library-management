import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import StudentProfile from "@/models/StudentProfile";
import Membership from "@/models/Membership";
import Seat from "@/models/Seat";
import SeatAssignment from "@/models/SeatAssignment";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";
import Expense from "@/models/Expense";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalStudents = await User.countDocuments({ role: "student" });
    const activeStudents = await Membership.countDocuments({ status: "active", endDate: { $gte: now } });

    const totalSeats = await Seat.countDocuments({ isActive: true });
    const occupiedSeats = await SeatAssignment.countDocuments({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });
    const availableSeats = totalSeats - occupiedSeats;

    const morningShiftOccupancy = await SeatAssignment.countDocuments({ shiftType: "morning", isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });
    const eveningShiftOccupancy = await SeatAssignment.countDocuments({ shiftType: "evening", isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });
    const fullDayOccupancy = await SeatAssignment.countDocuments({ shiftType: "full_day", isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });

    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today }, status: "present" });

    const monthlyPayments = await Payment.aggregate([
      { $match: { status: "completed", paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);
    const monthlyFeeCollection = monthlyPayments[0]?.total || 0;

    const onlinePayments = await Payment.aggregate([
      { $match: { status: "completed", method: "online", paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);
    const onlinePaymentCollection = onlinePayments[0]?.total || 0;

    const offlinePayments = await Payment.aggregate([
      { $match: { status: "completed", method: { $ne: "online" }, paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);
    const offlinePaymentCollection = offlinePayments[0]?.total || 0;

    const monthlyExpenses = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = monthlyExpenses[0]?.total || 0;
    const netIncome = monthlyFeeCollection - totalExpenses;

    const monthlyCollectionChart = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } },
          total: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    const admissionsChart = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    const recentPayments = await Payment.find({ status: "completed" })
      .populate("studentId", "name email")
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean();

    return success({
      totalStudents,
      activeStudents,
      totalSeats,
      occupiedSeats,
      availableSeats,
      morningShiftOccupancy,
      eveningShiftOccupancy,
      fullDayOccupancy,
      todayAttendance,
      monthlyFeeCollection,
      onlinePaymentCollection,
      offlinePaymentCollection,
      monthlyExpenses: totalExpenses,
      netIncome,
      recentPayments,
    });
  } catch (err: any) {
    return error(err.message || "Failed to load dashboard");
  }
}
