"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Armchair, Clock, CalendarDays, IndianRupee } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

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
  const daysLeft = membership?.endDate
    ? Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Seat</h1>

      {membership?.seatId ? (
        <>
          {/* Seat Card */}
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-8 text-center">
              <Armchair className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Seat {membership.seatId.seatNumber}</h2>
              <div className="flex justify-center gap-3 flex-wrap">
                <Badge variant="success" className="text-sm px-4 py-1">
                  {membership.shiftType?.replace("_", " ").toUpperCase()}
                </Badge>
                {membership.planId?.startTime && membership.planId?.endTime && (
                  <Badge variant="outline" className="text-sm px-4 py-1 text-gray-300">
                    {membership.planId.startTime} — {membership.planId.endTime}
                  </Badge>
                )}
                {daysLeft <= 7 && daysLeft > 0 && (
                  <Badge variant="warning" className="text-sm px-4 py-1">
                    {daysLeft} days left
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plan Details */}
            {membership.planId && (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" /> Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Name</span>
                    <span className="text-white font-medium">{membership.planId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Fee</span>
                    <span className="text-white font-medium">{formatCurrency(membership.planId.monthlyFee)}</span>
                  </div>
                  {membership.planId.securityDeposit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Security Deposit</span>
                      <span className="text-white font-medium">{formatCurrency(membership.planId.securityDeposit)}</span>
                    </div>
                  )}
                  {membership.planId.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white font-medium">{membership.planId.duration} {membership.planId.durationUnit || "months"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Membership Period */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-emerald-400" /> Membership Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Date</span>
                  <span className="text-white font-medium">{formatDate(membership.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expiry Date</span>
                  <span className={`font-medium ${daysLeft <= 7 ? "text-red-400" : "text-white"}`}>{formatDate(membership.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Remaining</span>
                  <span className={`font-medium ${daysLeft <= 7 ? "text-red-400" : "text-white"}`}>{daysLeft} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(membership.amountPaid)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {daysLeft <= 7 && daysLeft > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 shrink-0" />
              Your membership expires in {daysLeft} days. Contact the admin to renew.
            </div>
          )}
        </>
      ) : (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-12 text-center">
            <Armchair className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No seat assigned yet</p>
            <p className="text-sm text-gray-500 mt-1">Contact the admin to get a seat</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
