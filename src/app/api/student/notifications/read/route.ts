import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, success, error } from "@/lib/api-utils";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    if (body.notificationId) {
      await Notification.updateOne(
        { _id: body.notificationId, "recipients.studentId": user.id },
        { $set: { "recipients.$.read": true, "recipients.$.readAt": new Date() } }
      );
    } else {
      await Notification.updateMany(
        { "recipients.studentId": user.id, "recipients.read": false },
        { $set: { "recipients.$[elem].read": true, "recipients.$[elem].readAt": new Date() } },
        { arrayFilters: [{ "elem.studentId": user.id }] }
      );
    }

    return success(null, "Notifications marked as read");
  } catch (err: any) {
    return error(err.message || "Failed to mark notifications");
  }
}
