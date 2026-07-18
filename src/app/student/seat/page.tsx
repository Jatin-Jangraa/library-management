"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Armchair } from "lucide-react";

export default function StudentSeatPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.data); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load</p>;

  const { membership } = profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Seat</h1>

      {membership?.seatId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Armchair className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold mb-2">Seat {membership.seatId.seatNumber}</h2>
            <div className="flex justify-center gap-4">
              <Badge variant="success" className="text-lg px-4 py-1">{membership.shiftType?.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Armchair className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No seat assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">Contact the admin to get a seat assigned</p>
          </CardContent>
        </Card>
      )}

      {membership?.planId && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Plan Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500">Plan Name</p><p className="font-semibold">{membership.planId.name}</p></div>
              <div><p className="text-sm text-gray-500">Shift</p><p className="font-semibold capitalize">{membership.shiftType?.replace("_", " ")}</p></div>
              <div><p className="text-sm text-gray-500">Monthly Fee</p><p className="font-semibold">₹{membership.planId.monthlyFee}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
