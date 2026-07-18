import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const studentId = searchParams.get("studentId");

    const query: any = { date: new Date(date) };
    if (studentId) query.studentId = studentId;

    const records = await Attendance.find(query)
      .populate("studentId", "name email phone")
      .populate("markedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return success(records);
  } catch (err: any) {
    return error(err.message || "Failed to fetch attendance");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    if (body.records) {
      const bulkOps = body.records.map((record: any) => ({
        updateOne: {
          filter: { studentId: record.studentId, date: new Date(body.date) },
          update: {
            $set: {
              status: record.status,
              markedBy: user.id,
              notes: record.notes,
            },
          },
          upsert: true,
        },
      }));
      await Attendance.bulkWrite(bulkOps);
      return success(null, "Attendance marked for all students");
    }

    const existing = await Attendance.findOne({ studentId: body.studentId, date: new Date(body.date) });
    if (existing) {
      existing.status = body.status;
      existing.checkInTime = body.checkInTime;
      existing.checkOutTime = body.checkOutTime;
      existing.markedBy = user.id;
      await existing.save();
      return success(existing, "Attendance updated");
    }

    const record = await Attendance.create({
      studentId: body.studentId,
      date: new Date(body.date),
      status: body.status,
      checkInTime: body.checkInTime,
      checkOutTime: body.checkOutTime,
      markedBy: user.id,
      notes: body.notes,
    });

    return success(record, "Attendance marked");
  } catch (err: any) {
    return error(err.message || "Failed to mark attendance");
  }
}
