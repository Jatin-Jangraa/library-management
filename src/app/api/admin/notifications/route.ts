import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Membership from "@/models/Membership";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const notifications = await Notification.find({ sentBy: user.id })
      .populate("recipients.studentId", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return success(notifications);
  } catch (err: any) {
    return error(err.message || "Failed to fetch notifications");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    let targetStudentIds: string[] = [];

    if (body.targetAudience === "all") {
      const students = await User.find({ role: "student", isActive: true }).select("_id");
      targetStudentIds = students.map((s) => s._id.toString());
    } else if (body.targetAudience === "morning" || body.targetAudience === "evening" || body.targetAudience === "full_day") {
      const memberships = await Membership.find({ status: "active", shiftType: body.targetAudience }).select("studentId");
      targetStudentIds = memberships.map((m) => m.studentId.toString());
    } else if (body.targetAudience === "pending_fees") {
      const memberships = await Membership.find({ pendingAmount: { $gt: 0 } }).select("studentId");
      targetStudentIds = memberships.map((m) => m.studentId.toString());
    } else if (body.targetAudience === "expired") {
      const memberships = await Membership.find({ status: "expired" }).select("studentId");
      targetStudentIds = memberships.map((m) => m.studentId.toString());
    } else if (body.targetAudience === "specific" && body.specificStudentIds) {
      targetStudentIds = body.specificStudentIds;
    }

    const recipients = targetStudentIds.map((id) => ({
      studentId: id,
      read: false,
      delivered: true,
    }));

    const notification = await Notification.create({
      title: body.title,
      message: body.message,
      type: body.type,
      targetAudience: body.targetAudience,
      specificStudentIds: targetStudentIds,
      sentBy: user.id,
      sendEmail: body.sendEmail || false,
      recipients,
    });

    return success(notification, "Notification sent");
  } catch (err: any) {
    return error(err.message || "Failed to send notification");
  }
}
