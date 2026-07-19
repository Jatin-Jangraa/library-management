"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Armchair, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentSeatPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load</p>;

  const { membership } = profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Seat</h1>

      {membership?.seatId ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-8 text-center">
            <Armchair className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">Seat {membership.seatId.seatNumber}</h2>
            <div className="flex justify-center gap-3">
              <Badge variant="success" className="text-sm px-4 py-1">{membership.shiftType?.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-12 text-center">
            <Armchair className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No seat assigned yet</p>
            <p className="text-sm text-gray-500 mt-1">Contact the admin to get a seat</p>
          </CardContent>
        </Card>
      )}

      {membership && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Membership Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {membership.planId && (
                <div>
                  <p className="text-gray-500">Plan</p>
                  <p className="text-white font-medium">{membership.planId.name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Shift</p>
                <p className="text-white font-medium capitalize">{membership.shiftType?.replace("_", " ")}</p>
              </div>
              {membership.startDate && (
                <div>
                  <p className="text-gray-500">From</p>
                  <p className="text-white font-medium">{formatDate(membership.startDate)}</p>
                </div>
              )}
              {membership.endDate && (
                <div>
                  <p className="text-gray-500">Until</p>
                  <p className="text-white font-medium">{formatDate(membership.endDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
