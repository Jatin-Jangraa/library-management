"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load profile</p>;

  const { user, profile: studentProfile, membership } = profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {/* <Badge variant={user?.isActive ? "success" : "destructive"}>
              {user?.isActive ? "Active" : "Inactive"}
            </Badge> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div><p className="text-sm text-gray-500">Student ID</p><p className="font-mono font-medium">{studentProfile?.studentId}</p></div>
              <div><p className="text-sm text-gray-500">Full Name</p><p className="font-medium">{user?.name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{user?.email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{user?.phone}</p></div>
              <div><p className="text-sm text-gray-500">Father&apos;s Name</p><p className="font-medium">{studentProfile?.fatherName || "-"}</p></div>
              <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium capitalize">{studentProfile?.gender || "-"}</p></div>
            </div>
            <div className="space-y-3">
              <div><p className="text-sm text-gray-500">Course / Exam</p><p className="font-medium">{studentProfile?.course || "-"}</p></div>
              <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{studentProfile?.address || "-"}</p></div>
              <div><p className="text-sm text-gray-500">Emergency Contact</p><p className="font-medium">{studentProfile?.emergencyContact || "-"}</p></div>
              <div><p className="text-sm text-gray-500">ID Proof</p><p className="font-medium">{studentProfile?.idProofType ? `${studentProfile.idProofType.toUpperCase()}: ${studentProfile.idProofNumber}` : "-"}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {membership && (
        <Card>
          <CardHeader><CardTitle>Current Membership</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div><p className="text-sm text-gray-500">Plan</p><p className="font-semibold">{membership.planId?.name}</p></div>
                <div><p className="text-sm text-gray-500">Shift</p><p className="font-semibold capitalize">{membership.shiftType?.replace("_", " ")}</p></div>
              </div>
              <div className="space-y-2">
                <div><p className="text-sm text-gray-500">Start Date</p><p className="font-semibold">{formatDate(membership.startDate)}</p></div>
                <div><p className="text-sm text-gray-500">Expiry Date</p><p className="font-semibold">{formatDate(membership.endDate)}</p></div>
              </div>
              <div className="space-y-2">
                <div><p className="text-sm text-gray-500">Seat Number</p><p className="font-semibold">{membership.seatId?.seatNumber || "Not assigned"}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><Badge variant={membership.status === "active" ? "success" : "destructive"} className="capitalize">{membership.status}</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
