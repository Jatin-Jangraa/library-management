import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireOwner, success, error, badRequest } from "@/lib/api-utils";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";
import LibrarySettings from "@/models/LibrarySettings";
import { generateStudentId, generateRandomPassword } from "@/lib/utils";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const profileFilter: any = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      const matchingUsers = await User.find({
        role: "student",
        $or: [
          { name: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
          { phone: { $regex: safeSearch, $options: "i" } },
        ],
      }).select("_id");
      profileFilter.userId = { $in: matchingUsers.map((u) => u._id) };
    }

    if (status === "active") {
      profileFilter.isArchived = false;
    } else if (status === "archived") {
      profileFilter.isArchived = true;
    }

    const allMatching = await StudentProfile.find(profileFilter)
      .populate("userId", "name email phone isActive role lastLogin")
      .sort({ createdAt: -1 })
      .lean();

    const students = allMatching
      .filter((s: any) => s.userId?.role === "student")
      .slice(skip, skip + limit);

    const total = allMatching.filter((s: any) => s.userId?.role === "student").length;

    const studentUserIds = students.map((s: any) => s.userId?._id).filter(Boolean);
    const memberships = await Membership.find({
      studentId: { $in: studentUserIds },
      status: "active",
    })
      .populate("planId", "name shiftType")
      .populate("seatId", "seatNumber")
      .lean();

    const membershipMap = new Map<string, any>();
    memberships.forEach((m: any) => membershipMap.set(m.studentId.toString(), m));

    const studentsWithMembership = students.map((student: any) => ({
      ...student,
      currentMembership: membershipMap.get(student.userId?._id?.toString()) || null,
    }));

    return success({
      students: studentsWithMembership,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch students");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOwner();
    if (!user) return error("Unauthorized", 401);

    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email || !body.phone) {
      return badRequest("Name, email, and phone are required");
    }

    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) return badRequest("Email already exists");

    const settings = await LibrarySettings.findOne();
    const prefix = settings?.studentIdPrefix || "LIB";

    const password = generateRandomPassword();
    const newUser = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password,
      displayPassword: password,
      role: "student",
    });

    const profile = await StudentProfile.create({
      userId: newUser._id,
      studentId: generateStudentId(prefix),
      fatherName: body.fatherName,
      alternatePhone: body.alternatePhone,
      address: body.address,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      course: body.course,
      emergencyContact: body.emergencyContact,
      idProofType: body.idProofType,
      idProofNumber: body.idProofNumber,
      notes: body.notes,
    });

    return success({
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role },
      profile,
      generatedPassword: password,
    }, "Student added successfully");
  } catch (err: any) {
    return error(err.message || "Failed to add student");
  }
}
