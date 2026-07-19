import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Payment from "@/models/Payment";
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
    const skip = (page - 1) * limit;

    const query: any = {};
    if (studentId) query.studentId = studentId;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("studentId", "name email phone")
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

    const amount = Number(body.amount);
    if (!amount || amount <= 0) return error("Invalid amount", 400);

    const payment = await Payment.create({
      studentId: body.studentId,
      amount,
      finalAmount: amount,
      method: body.method || "cash",
      purpose: body.purpose || "monthly_fee",
      status: "completed",
      receiptNumber: generateReceiptNumber(),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      notes: body.notes,
      receivedBy: user.id,
    });

    return success(payment, "Payment recorded");
  } catch (err: any) {
    return error(err.message || "Failed to record payment");
  }
}
