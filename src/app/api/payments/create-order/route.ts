import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error, badRequest } from "@/lib/api-utils";
import MembershipPlan from "@/models/MembershipPlan";
import Membership from "@/models/Membership";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const plan = await MembershipPlan.findById(body.planId);
    if (!plan) return badRequest("Plan not found");

    const amount = plan.monthlyFee + plan.admissionFee + plan.securityDeposit;

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: config.currency.code,
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        studentId: user.id,
        planId: plan._id.toString(),
      },
    });

    return success({
      orderId: order.id,
      amount: amount,
      currency: order.currency,
      planName: plan.name,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    return error(err.message || "Failed to create order");
  }
}
