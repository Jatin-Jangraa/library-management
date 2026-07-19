"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, CreditCard, Armchair, CalendarDays, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile");
      const d = await res.json();
      setProfile(d.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleMarkAttendance = async () => {
    setMarking(true);
    setMsg("");
    try {
      const res = await fetch("/api/student/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "" }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsgType("success");
        setMsg(d.message || "Attendance marked!");
        fetchProfile();
      } else {
        setMsgType("error");
        setMsg(d.error || "Failed to mark attendance");
      }
    } catch {
      setMsgType("error");
      setMsg("Failed to mark attendance");
    }
    setMarking(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load profile</p>;

  const { user, membership, recentPayments, attendance } = profile;
  const todayRecord = attendance?.todayRecord;
  const stats = attendance?.stats;

  const daysLeft = membership?.endDate
    ? Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h1>
        <p className="text-gray-400">Here&apos;s your library dashboard</p>
      </div>

      {/* Attendance Mark Card - prominent on dashboard */}
      <Card className={`border-2 transition-all duration-300 ${todayRecord ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
        <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {todayRecord ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-7 w-7 text-blue-400" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-white">
                {todayRecord ? "Attendance Marked Today" : "Mark Today's Attendance"}
              </p>
              <p className="text-sm text-gray-400">
                {todayRecord
                  ? `Marked at ${todayRecord.checkInTime} — ${todayRecord.status === "late" ? "Late" : "Present"}`
                  : "Click the button to mark your attendance for today"
                }
              </p>
            </div>
          </div>
          {!todayRecord ? (
            <Button
              onClick={handleMarkAttendance}
              disabled={marking}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12 px-8 text-base"
            >
              {marking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              Mark Present
            </Button>
          ) : (
            <Badge variant={todayRecord.status === "late" ? "warning" : "success"} className="text-sm px-4 py-1.5">
              {todayRecord.status === "late" ? "Late" : "Present"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {msg && (
        <div className={`text-sm p-3 rounded-xl flex items-center gap-2 ${msgType === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
          {msgType === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {msg}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <Armchair className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <p className="text-xl font-bold text-white">{membership?.seatId?.seatNumber || "—"}</p>
            <p className="text-xs text-gray-400">My Seat</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
            <p className="text-xl font-bold text-emerald-400">{stats?.present || 0}</p>
            <p className="text-xs text-gray-400">Days Present</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <p className="text-xl font-bold text-amber-400">{stats?.late || 0}</p>
            <p className="text-xs text-gray-400">Late</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <p className="text-xl font-bold text-white">{daysLeft}</p>
            <p className="text-xs text-gray-400">Days Left</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Details */}
      {membership ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Membership Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="font-semibold text-white">{membership.planId?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Shift</p>
                  <p className="font-semibold text-white capitalize">{membership.shiftType?.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Fee</p>
                  <p className="font-semibold text-white">{formatCurrency(membership.planId?.monthlyFee || 0)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-semibold text-white">{formatDate(membership.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expiry Date</p>
                  <p className={`font-semibold ${daysLeft <= 7 ? "text-red-400" : "text-white"}`}>{formatDate(membership.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seat</p>
                  <p className="font-semibold text-white">{membership.seatId?.seatNumber || "Not assigned"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Total Paid</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(membership.amountPaid)}</p>
                </div>
                {membership.planId?.securityDeposit > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Security Deposit</p>
                    <p className="font-semibold text-white">{formatCurrency(membership.planId.securityDeposit)}</p>
                  </div>
                )}
              </div>
            </div>
            {daysLeft <= 7 && daysLeft > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                Your membership expires in {daysLeft} days. Contact admin to renew.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-12 text-center">
            <Armchair className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No active membership</p>
            <p className="text-sm text-gray-500 mt-1">Contact the admin to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance Summary + Recent Payments */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">This Month&apos;s Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Present</span><span className="font-semibold text-emerald-400">{stats?.present || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Late</span><span className="font-semibold text-amber-400">{stats?.late || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Absent</span><span className="font-semibold text-red-400">{stats?.absent || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Leave</span><span className="font-semibold text-gray-400">{stats?.leave || 0}</span></div>
              <div className="border-t border-gray-800 pt-3 flex justify-between">
                <span className="text-gray-300 font-medium">Total Marked</span>
                <span className="font-bold text-white">{stats?.total || 0} days</span>
              </div>
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
                      <p className="text-xs text-gray-500">{p.method} &middot; {p.receiptNumber}</p>
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
