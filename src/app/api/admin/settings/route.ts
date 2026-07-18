import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error } from "@/lib/api-utils";
import LibrarySettings from "@/models/LibrarySettings";

export async function GET() {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    let settings = await LibrarySettings.findOne();
    if (!settings) {
      settings = await LibrarySettings.create({});
    }
    return success(settings);
  } catch (err: any) {
    return error(err.message || "Failed to fetch settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    let settings = await LibrarySettings.findOne();
    if (!settings) {
      settings = await LibrarySettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return success(settings, "Settings updated");
  } catch (err: any) {
    return error(err.message || "Failed to update settings");
  }
}
