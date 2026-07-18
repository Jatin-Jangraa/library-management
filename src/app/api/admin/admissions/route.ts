import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const query: any = {};
    if (status !== "all") query.status = status;

    const admissions = await Membership.find(query)
      .populate("studentId", "name email phone")
      .populate("planId", "name shiftType monthlyFee")
      .populate("seatId", "seatNumber")
      .sort({ createdAt: -1 })
      .lean();

    return success(admissions);
  } catch (err: any) {
    return error(err.message || "Failed to fetch admissions");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const student = await User.findById(body.studentId);
    if (!student) return badRequest("Student not found");

    const plan = await MembershipPlan.findById(body.planId);
    if (!plan) return badRequest("Plan not found");

    const startDate = new Date(body.startDate || Date.now());
    const endDate = new Date(startDate);
    if (plan.durationUnit === "months") endDate.setMonth(endDate.getMonth() + plan.duration);
    else if (plan.durationUnit === "weeks") endDate.setDate(endDate.getDate() + plan.duration * 7);
    else endDate.setDate(endDate.getDate() + plan.duration);

    const totalAmount = plan.monthlyFee + plan.admissionFee + plan.securityDeposit;

    const membership = await Membership.create({
      studentId: body.studentId,
      planId: body.planId,
      seatId: body.seatId,
      shiftType: plan.shiftType,
      startDate,
      endDate,
      status: "active",
      totalAmount,
      amountPaid: body.initialPayment || 0,
      pendingAmount: totalAmount - (body.initialPayment || 0),
      securityDepositPaid: body.securityDepositPaid || false,
      admissionFeePaid: body.admissionFeePaid || false,
      assignedBy: user.id,
      notes: body.notes,
    });

    return success(membership, "Admission processed");
  } catch (err: any) {
    return error(err.message || "Failed to process admission");
  }
}
