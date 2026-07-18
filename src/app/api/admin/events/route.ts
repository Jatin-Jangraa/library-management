import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Event from "@/models/Event";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const events = await Event.find().sort({ eventDate: -1 }).lean();
    return success(events);
  } catch (err: any) {
    return error(err.message || "Failed to fetch events");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const event = await Event.create({
      title: body.title,
      description: body.description,
      eventDate: new Date(body.eventDate),
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      targetAudience: body.targetAudience,
      isActive: body.isActive ?? true,
      createdBy: user.id,
    });

    return success(event, "Event created");
  } catch (err: any) {
    return error(err.message || "Failed to create event");
  }
}
