import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import SupportTicket from "@/models/SupportTicket";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const update: any = {};
    if (body.status) update.status = body.status;
    if (body.adminResponse) {
      update.adminResponse = body.adminResponse;
      update.respondedBy = user.id;
    }
    if (body.status === "resolved") update.resolvedAt = new Date();

    const ticket = await SupportTicket.findByIdAndUpdate(params.id, update, { new: true });
    if (!ticket) return error("Ticket not found", 404);

    return success(ticket, "Ticket updated");
  } catch (err: any) {
    return error(err.message || "Failed to update ticket");
  }
}
