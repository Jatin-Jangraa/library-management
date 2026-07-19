import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import SupportTicket from "@/models/SupportTicket";
import { generateTicketNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const tickets = await SupportTicket.find({ studentId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return success(tickets);
  } catch (err: any) {
    return error(err.message || "Failed to fetch tickets");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const ticket = await SupportTicket.create({
      ticketNumber: generateTicketNumber(),
      studentId: user.id,
      category: body.category,
      subject: body.subject,
      description: body.description,
      priority: body.priority || "medium",
    });

    return success(ticket, "Support ticket created");
  } catch (err: any) {
    return error(err.message || "Failed to create ticket");
  }
}
