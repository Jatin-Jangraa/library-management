import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import Seat from "@/models/Seat";
import SeatAssignment from "@/models/SeatAssignment";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();
    const { seatId, studentId, shiftType, startDate, endDate } = body;

    const seat = await Seat.findById(seatId);
    if (!seat) return badRequest("Seat not found");
    if (seat.status === "disabled" || seat.status === "maintenance") {
      return badRequest("Seat is not available");
    }

    const existingStudentSeat = await SeatAssignment.findOne({
      studentId,
      isActive: true,
    });
    if (existingStudentSeat) {
      const assignedSeat = await Seat.findById(existingStudentSeat.seatId).lean() as any;
      return badRequest(`This student already has seat ${assignedSeat?.seatNumber || "assigned"}. Release it first.`);
    }

    if (shiftType === "full_day") {
      const existingFullDay = await SeatAssignment.findOne({
        seatId,
        shiftType: "full_day",
        isActive: true,
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      });
      if (existingFullDay) return badRequest("Seat already occupied for full day in this period");
    } else {
      const existingFullDay = await SeatAssignment.findOne({
        seatId,
        shiftType: "full_day",
        isActive: true,
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      });
      if (existingFullDay) return badRequest("Seat is assigned to a full-day student in this period");

      const existingSameShift = await SeatAssignment.findOne({
        seatId,
        shiftType,
        isActive: true,
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      });
      if (existingSameShift) return badRequest(`Seat already occupied for ${shiftType} shift in this period`);
    }

    const assignment = await SeatAssignment.create({
      seatId,
      studentId,
      shiftType,
      startDate,
      endDate,
      assignedBy: user.id,
    });

    await Seat.findByIdAndUpdate(seatId, { status: "occupied" });
    await Membership.findOneAndUpdate({ studentId, status: "active" }, { seatId, shiftType });

    return success(assignment, "Seat assigned successfully");
  } catch (err: any) {
    return error(err.message || "Failed to assign seat");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();
    const { assignmentId, action, amount, method, months } = body;

    const assignment = await SeatAssignment.findById(assignmentId)
      .populate("studentId", "name email phone")
      .populate("seatId", "seatNumber");
    if (!assignment) return badRequest("Assignment not found");

    if (action === "extend") {
      const extendMonths = months || 1;
      const newEndDate = new Date(assignment.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + extendMonths);

      await SeatAssignment.findByIdAndUpdate(assignmentId, { endDate: newEndDate });

      await Membership.findOneAndUpdate(
        { studentId: assignment.studentId._id, status: "active" },
        { endDate: newEndDate }
      );

      return success({ newEndDate }, `Valid until ${newEndDate.toLocaleDateString()}`);
    }

    if (action === "pay") {
      if (!amount || amount <= 0) return badRequest("Invalid amount");

      const extendMonths = months || 1;
      const newEndDate = new Date(assignment.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + extendMonths);

      const receiptCount = await Payment.countDocuments();
      const receiptNumber = `RCP-${Date.now()}-${String(receiptCount + 1).padStart(4, "0")}`;

      const membership = await Membership.findOne({ studentId: assignment.studentId._id, status: "active" });

      const payment = await Payment.create({
        studentId: assignment.studentId._id,
        membershipId: membership?._id,
        amount: Number(amount),
        discount: 0,
        finalAmount: Number(amount),
        method: method || "cash",
        purpose: "monthly_fee",
        status: "completed",
        receiptNumber,
        paymentDate: new Date(),
        receivedBy: user.id,
      });

      await SeatAssignment.findByIdAndUpdate(assignmentId, { endDate: newEndDate });

      if (membership) {
        await Membership.findByIdAndUpdate(membership._id, {
          endDate: newEndDate,
          amountPaid: (membership.amountPaid || 0) + Number(amount),
          pendingAmount: Math.max(0, (membership.totalAmount || 0) - ((membership.amountPaid || 0) + Number(amount))),
        });
      }

      return success({ payment, newEndDate }, `Payment recorded. Valid until ${newEndDate.toLocaleDateString()}`);
    }

    return badRequest("Invalid action. Use 'extend' or 'pay'");
  } catch (err: any) {
    return error(err.message || "Failed to process");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("id");
    const seatId = searchParams.get("seatId");

    if (!assignmentId && !seatId) return badRequest("Provide assignment id or seatId");

    if (assignmentId) {
      const assignment = await SeatAssignment.findById(assignmentId);
      if (!assignment) return badRequest("Assignment not found");

      const seatToUpdate = assignment.seatId;
      await SeatAssignment.findByIdAndUpdate(assignmentId, { isActive: false });
      await Seat.findByIdAndUpdate(seatToUpdate, { status: "available" });

      return success(null, "Seat released");
    }

    if (seatId) {
      await SeatAssignment.updateMany({ seatId, isActive: true }, { isActive: false });
      await Seat.findByIdAndUpdate(seatId, { status: "available" });
      return success(null, "Seat released");
    }
  } catch (err: any) {
    return error(err.message || "Failed to release seat");
  }
}
