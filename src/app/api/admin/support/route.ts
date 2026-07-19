import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .populate("studentId", "name email phone")
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return success(tickets);
  } catch (err: any) {
    return error(err.message || "Failed to fetch tickets");
  }
}
