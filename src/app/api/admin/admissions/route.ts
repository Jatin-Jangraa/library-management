import { NextRequest } from "next/server";
import { error } from "@/lib/api-utils";

export async function GET() {
  return error("Admissions removed. Use /api/admin/students instead.", 410);
}

export async function POST() {
  return error("Admissions removed. Use seat assignment instead.", 410);
}
