import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import Seat from "@/models/Seat";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    const seat = await Seat.findByIdAndUpdate(
      params.id,
      { seatNumber: body.seatNumber, features: body.features, status: body.status, isActive: body.isActive },
      { new: true }
    );

    if (!seat) return error("Seat not found", 404);
    return success(seat, "Seat updated");
  } catch (err: any) {
    return error(err.message || "Failed to update seat");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const seat = await Seat.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!seat) return error("Seat not found", 404);

    return success(null, "Seat removed");
  } catch (err: any) {
    return error(err.message || "Failed to delete seat");
  }
}
