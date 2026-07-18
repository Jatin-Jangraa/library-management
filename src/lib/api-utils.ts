import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { connectDB } from "./db";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function requireOwner() {
  const user = await requireAuth();
  if (!user || user.role !== "owner") {
    return null;
  }
  return user;
}

export async function requireStaffOrOwner() {
  const user = await requireAuth();
  if (!user || (user.role !== "owner" && user.role !== "staff")) {
    return null;
  }
  return user;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function success(data: any, message?: string) {
  const response: any = { success: true, data };
  if (message) response.message = message;
  return NextResponse.json(response);
}

export function error(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function ensureDB() {
  await connectDB();
}
