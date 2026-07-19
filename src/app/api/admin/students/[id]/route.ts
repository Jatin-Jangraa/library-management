import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Membership from "@/models/Membership";
import Payment from "@/models/Payment";
import Attendance from "@/models/Attendance";
import SeatAssignment from "@/models/SeatAssignment";
import SupportTicket from "@/models/SupportTicket";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const studentUser = await User.findById(params.id);
    if (!studentUser) return error("Student not found", 404);

    const profile = await StudentProfile.findOne({ userId: params.id }).lean();
    const memberships = await Membership.find({ studentId: params.id })
      .populate("planId", "name shiftType monthlyFee securityDeposit")
      .populate("seatId", "seatNumber")
      .sort({ createdAt: -1 })
      .lean();

    const payments = await Payment.find({ studentId: params.id }).sort({ paymentDate: -1 }).limit(20).lean();

    const attendance = await Attendance.find({ studentId: params.id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const activeMembership = memberships.find((m: any) => m.status === "active");

    return success({
      user: studentUser,
      profile,
      memberships,
      payments,
      attendance,
      activeMembership,
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch student");
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { name: body.name, phone: body.phone, email: body.email, isActive: body.isActive },
      { new: true }
    );

    if (!updatedUser) return error("Student not found", 404);

    await StudentProfile.findOneAndUpdate(
      { userId: params.id },
      {
        fatherName: body.fatherName,
        alternatePhone: body.alternatePhone,
        address: body.address,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        course: body.course,
        emergencyContact: body.emergencyContact,
        idProofType: body.idProofType,
        idProofNumber: body.idProofNumber,
        notes: body.notes,
      },
      { upsert: true }
    );

    return success(updatedUser, "Student updated successfully");
  } catch (err: any) {
    return error(err.message || "Failed to update student");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const studentUser = await User.findById(params.id);
    if (!studentUser) return error("Student not found", 404);
    if (studentUser.role !== "student") return badRequest("Can only delete student accounts");

    const seatAssignments = await SeatAssignment.find({ studentId: params.id, isActive: true });
    const seatIds = seatAssignments.map((sa: any) => sa.seatId);

    await Promise.all([
      SeatAssignment.deleteMany({ studentId: params.id }),
      Membership.deleteMany({ studentId: params.id }),
      Payment.deleteMany({ studentId: params.id }),
      Attendance.deleteMany({ studentId: params.id }),
      StudentProfile.deleteOne({ userId: params.id }),
      SupportTicket.deleteMany({ studentId: params.id }),
      User.findByIdAndDelete(params.id),
    ]);

    if (seatIds.length > 0) {
      const Seat = (await import("@/models/Seat")).default;
      await Seat.updateMany({ _id: { $in: seatIds } }, { status: "available" });
    }

    await Notification.updateMany(
      { "recipients.studentId": params.id },
      { $pull: { recipients: { studentId: params.id } } }
    );

    return success(null, "Student deleted permanently");
  } catch (err: any) {
    return error(err.message || "Failed to delete student");
  }
}
