"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, CreditCard, Armchair, CalendarDays } from "lucide-react";

export default function StudentDashboard() {
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
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load profile</p>;

  const { user, membership, recentPayments, attendanceStats } = profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h1>
        <p className="text-gray-400">Here&apos;s your library dashboard</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl"><Armchair className="h-5 w-5 text-blue-400" /></div>
              <div>
                <p className="text-xs text-gray-400">Membership</p>
                <Badge variant={membership?.status === "active" ? "success" : "destructive"} className="mt-1">
                  {membership?.status?.toUpperCase() || "NO MEMBERSHIP"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><Armchair className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-xs text-gray-400">My Seat</p>
                <p className="font-bold text-white">{membership?.seatId?.seatNumber || "Not assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl"><CalendarDays className="h-5 w-5 text-orange-400" /></div>
              <div>
                <p className="text-xs text-gray-400">Attendance</p>
                <p className="font-bold text-white">{attendanceStats?.percentage || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {membership && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Membership Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div><p className="text-sm text-gray-400">Plan</p><p className="font-semibold text-white">{membership.planId?.name}</p></div>
                <div><p className="text-sm text-gray-400">Shift</p><p className="font-semibold text-white capitalize">{membership.shiftType?.replace("_", " ")}</p></div>
                <div><p className="text-sm text-gray-400">Monthly Fee</p><p className="font-semibold text-white">{formatCurrency(membership.planId?.monthlyFee || 0)}</p></div>
              </div>
              <div className="space-y-2">
                <div><p className="text-sm text-gray-400">Start Date</p><p className="font-semibold text-white">{formatDate(membership.startDate)}</p></div>
                <div><p className="text-sm text-gray-400">Expiry Date</p><p className="font-semibold text-white">{formatDate(membership.endDate)}</p></div>
                <div><p className="text-sm text-gray-400">Seat</p><p className="font-semibold text-white">{membership.seatId?.seatNumber || "Not assigned"}</p></div>
              </div>
              <div className="space-y-2">
                <div><p className="text-sm text-gray-400">Total Paid</p><p className="font-semibold text-emerald-400">{formatCurrency(membership.amountPaid)}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Attendance Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Days Present</span><span className="font-semibold text-white">{attendanceStats?.presentDays || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Days</span><span className="font-semibold text-white">{attendanceStats?.totalDays || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Attendance %</span><span className="font-semibold text-white">{attendanceStats?.percentage || 0}%</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            {recentPayments?.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.map((p: any) => (
                  <div key={p._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(p.paymentDate)}</p>
                      <p className="text-xs text-gray-500">{p.method} - {p.receiptNumber}</p>
                    </div>
                    <span className="font-semibold text-emerald-400">{formatCurrency(p.finalAmount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No payments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
