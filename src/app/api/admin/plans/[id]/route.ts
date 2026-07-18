import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import MembershipPlan from "@/models/MembershipPlan";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const plan = await MembershipPlan.findByIdAndUpdate(params.id, body, { new: true });
    if (!plan) return error("Plan not found", 404);

    return success(plan, "Plan updated");
  } catch (err: any) {
    return error(err.message || "Failed to update plan");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { isActive } = await req.json();

    const plan = await MembershipPlan.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );
    if (!plan) return error("Plan not found", 404);

    return success(plan, isActive ? "Plan activated" : "Plan deactivated");
  } catch (err: any) {
    return error(err.message || "Failed to update plan");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    await MembershipPlan.findByIdAndUpdate(params.id, { isActive: false });
    return success(null, "Plan deactivated");
  } catch (err: any) {
    return error(err.message || "Failed to delete plan");
  }
}
