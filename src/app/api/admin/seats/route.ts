import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import Seat from "@/models/Seat";
import SeatAssignment from "@/models/SeatAssignment";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const seatsRaw = await Seat.find({ isActive: true }).lean();

    const seats = seatsRaw.sort((a: any, b: any) => {
      const numA = parseInt(a.seatNumber);
      const numB = parseInt(b.seatNumber);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.seatNumber.localeCompare(b.seatNumber);
    });

    const now = new Date();
    const assignments = await SeatAssignment.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("studentId", "name email phone")
      .lean();

    const seatsWithAssignment = seats.map((seat: any) => {
      const assignment = assignments.find((a: any) => a.seatId.toString() === seat._id.toString());
      return { ...seat, currentAssignment: assignment || null };
    });

    return success({ seats: seatsWithAssignment });
  } catch (err: any) {
    return error(err.message || "Failed to fetch seats");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    if (body.type === "seat") {
      if (!body.seatNumber) return badRequest("Seat number is required");

      const existing = await Seat.findOne({ seatNumber: body.seatNumber });
      if (existing) return badRequest("Seat number already exists");

      const seat = await Seat.create({
        seatNumber: body.seatNumber,
        floor: body.floor || "",
        features: body.features || [],
        status: "available",
      });

      return success(seat, "Seat added");
    }

    if (body.type === "bulk") {
      const { prefix = "", startNumber = 1, count = 1 } = body;
      const seatsToCreate = [];
      const createdSeats = [];
      const duplicates: string[] = [];

      for (let i = 0; i < count; i++) {
        const seatNum = `${prefix}${startNumber + i}`;
        seatsToCreate.push({
          seatNumber: seatNum,
          floor: body.floor || "",
          features: body.features || [],
          status: "available" as const,
        });
      }

      for (const seatData of seatsToCreate) {
        const existing = await Seat.findOne({ seatNumber: seatData.seatNumber });
        if (!existing) {
          const seat = await Seat.create(seatData);
          createdSeats.push(seat);
        } else {
          duplicates.push(seatData.seatNumber);
        }
      }

      return success({ seats: createdSeats, count: createdSeats.length, duplicates }, `${createdSeats.length} seats added`);
    }

    return badRequest("Invalid type. Use 'seat' or 'bulk'");
  } catch (err: any) {
    return error(err.message || "Failed to create");
  }
}
