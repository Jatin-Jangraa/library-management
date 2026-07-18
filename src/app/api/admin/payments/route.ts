import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Payment from "@/models/Payment";
import Membership from "@/models/Membership";
import { generateReceiptNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const studentId = searchParams.get("studentId");
    const method = searchParams.get("method");
    const purpose = searchParams.get("purpose");
    const skip = (page - 1) * limit;

    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (method) query.method = method;
    if (purpose) query.purpose = purpose;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("studentId", "name email phone")
      .populate("planId", "name")
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return success({
      payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch payments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const discount = body.discount || 0;
    const finalAmount = body.amount - discount;

    const payment = await Payment.create({
      studentId: body.studentId,
      membershipId: body.membershipId,
      planId: body.planId,
      amount: body.amount,
      discount,
      finalAmount,
      method: body.method,
      purpose: body.purpose,
      status: "completed",
      receiptNumber: generateReceiptNumber(),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      notes: body.notes,
      receivedBy: user.id,
    });

    if (body.membershipId) {
      const membership = await Membership.findById(body.membershipId);
      if (membership) {
        membership.amountPaid += finalAmount;
        membership.pendingAmount = Math.max(0, membership.totalAmount - membership.amountPaid);
        await membership.save();
      }
    }

    return success(payment, "Payment recorded");
  } catch (err: any) {
    return error(err.message || "Failed to record payment");
  }
}
