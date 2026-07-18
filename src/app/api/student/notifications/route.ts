import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const notifications = await Notification.find({
      "recipients.studentId": user.id,
    })
      .select("title message type createdAt recipients sentBy")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = notifications.map((n: any) => {
      const recipient = n.recipients.find(
        (r: any) => r.studentId.toString() === user.id
      );
      return {
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt,
        read: recipient?.read || false,
      };
    });

    return success(formatted);
  } catch (err: any) {
    return error(err.message || "Failed to fetch notifications");
  }
}
