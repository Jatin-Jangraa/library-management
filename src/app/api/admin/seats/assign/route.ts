import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import User from "@/models/User";
import Seat from "@/models/Seat";
import SeatAssignment from "@/models/SeatAssignment";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();
    const { seatId, studentId, planId } = body;

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

    if (!planId) return badRequest("Membership plan is required");

    const plan = await MembershipPlan.findById(planId);
    if (!plan) return badRequest("Plan not found");

    const shiftType = plan.shiftType === "custom" ? "full_day" : plan.shiftType;

    if (shiftType === "full_day") {
      const existingFullDay = await SeatAssignment.findOne({
        seatId,
        shiftType: "full_day",
        isActive: true,
      });
      if (existingFullDay) return badRequest("Seat already occupied for full day");
    } else {
      const existingFullDay = await SeatAssignment.findOne({
        seatId,
        shiftType: "full_day",
        isActive: true,
      });
      if (existingFullDay) return badRequest("Seat is assigned to a full-day student in this period");

      const existingSameShift = await SeatAssignment.findOne({
        seatId,
        shiftType,
        isActive: true,
      });
      if (existingSameShift) return badRequest(`Seat already occupied for ${shiftType} shift`);
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.durationUnit === "months") {
      endDate.setMonth(endDate.getMonth() + plan.duration);
    } else if (plan.durationUnit === "weeks") {
      endDate.setDate(endDate.getDate() + plan.duration * 7);
    } else {
      endDate.setDate(endDate.getDate() + plan.duration);
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

    const existingMembership = await Membership.findOne({ studentId, status: "active" });
    if (existingMembership) {
      await Membership.findByIdAndUpdate(existingMembership._id, { seatId, shiftType, planId, startDate, endDate });
    } else {
      await Membership.create({
        studentId,
        planId,
        seatId,
        shiftType,
        startDate,
        endDate,
        status: "active",
        totalAmount: plan.monthlyFee,
        amountPaid: 0,
        assignedBy: user.id,
      });
    }

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
    const { assignmentId, action, months } = body;

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

    return badRequest("Invalid action. Use 'extend'");
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
      const studentToUnassign = assignment.studentId;
      await SeatAssignment.findByIdAndUpdate(assignmentId, { isActive: false });
      await Seat.findByIdAndUpdate(seatToUpdate, { status: "available" });

      await Membership.findOneAndUpdate(
        { studentId: studentToUnassign, status: "active" },
        { seatId: null, status: "cancelled" }
      );

      return success(null, "Seat released");
    }

    if (seatId) {
      const activeAssignments = await SeatAssignment.find({ seatId, isActive: true });
      const studentIds = activeAssignments.map((a) => a.studentId);

      await SeatAssignment.updateMany({ seatId, isActive: true }, { isActive: false });
      await Seat.findByIdAndUpdate(seatId, { status: "available" });

      if (studentIds.length > 0) {
        await Membership.updateMany(
          { studentId: { $in: studentIds }, status: "active", seatId: seatId },
          { seatId: null, status: "cancelled" }
        );
      }

      return success(null, "Seat released");
    }
  } catch (err: any) {
    return error(err.message || "Failed to release seat");
  }
}
