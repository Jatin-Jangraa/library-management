import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";
import { generateReceiptNumber } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return error("Payment verification failed", 400);
    }

    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment) {
      return error("Payment already processed", 400);
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) return error("Plan not found", 404);

    const amount = plan.monthlyFee + plan.admissionFee + plan.securityDeposit;

    const payment = await Payment.create({
      studentId: user.id,
      planId: planId,
      amount: amount,
      discount: 0,
      finalAmount: amount,
      method: "online",
      purpose: "admission",
      status: "completed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      receiptNumber: generateReceiptNumber(),
      paymentDate: new Date(),
    });

    const startDate = new Date();
    const endDate = new Date();
    if (plan.durationUnit === "months") endDate.setMonth(endDate.getMonth() + plan.duration);
    else if (plan.durationUnit === "weeks") endDate.setDate(endDate.getDate() + plan.duration * 7);
    else endDate.setDate(endDate.getDate() + plan.duration);

    const membership = await Membership.create({
      studentId: user.id,
      planId: planId,
      shiftType: plan.shiftType,
      startDate,
      endDate,
      status: "active",
      totalAmount: amount,
      amountPaid: amount,
      pendingAmount: 0,
      securityDepositPaid: plan.securityDeposit > 0,
      admissionFeePaid: plan.admissionFee > 0,
    });

    payment.membershipId = membership._id;
    await payment.save();

    return success({ payment, membership }, "Payment verified and membership activated");
  } catch (err: any) {
    return error(err.message || "Verification failed");
  }
}
