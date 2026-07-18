import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import MembershipPlan from "@/models/MembershipPlan";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const plans = await MembershipPlan.find().sort({ createdAt: -1 }).lean();
    return success(plans);
  } catch (err: any) {
    return error(err.message || "Failed to fetch plans");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const plan = await MembershipPlan.create({
      name: body.name,
      description: body.description,
      shiftType: body.shiftType,
      startTime: body.startTime,
      endTime: body.endTime,
      monthlyFee: body.monthlyFee,
      admissionFee: body.admissionFee || 0,
      securityDeposit: body.securityDeposit || 0,
      duration: body.duration,
      durationUnit: body.durationUnit,
      gracePeriod: body.gracePeriod || 0,
      lateFee: body.lateFee || 0,
      facilities: body.facilities || [],
    });

    return success(plan, "Plan created");
  } catch (err: any) {
    return error(err.message || "Failed to create plan");
  }
}
