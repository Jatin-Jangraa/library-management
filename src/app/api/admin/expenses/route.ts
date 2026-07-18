import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Expense from "@/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    const query: any = {};
    if (category) query.category = category;
    if (month) {
      const [year, m] = month.split("-").map(Number);
      query.date = {
        $gte: new Date(year, m - 1, 1),
        $lte: new Date(year, m, 0, 23, 59, 59),
      };
    }

    const expenses = await Expense.find(query)
      .populate("recordedBy", "name")
      .sort({ date: -1 })
      .lean();

    const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    return success({ expenses, total });
  } catch (err: any) {
    return error(err.message || "Failed to fetch expenses");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const expense = await Expense.create({
      date: new Date(body.date),
      category: body.category,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      description: body.description,
      vendor: body.vendor,
      notes: body.notes,
      recordedBy: user.id,
    });

    return success(expense, "Expense recorded");
  } catch (err: any) {
    return error(err.message || "Failed to record expense");
  }
}
