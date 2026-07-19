"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/attendance?month=${month}&year=${year}`);
      const d = await res.json();
      setData(d.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAttendance(); }, [month, year]);

  const handleMark = async () => {
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
        setMsg(d.message || "Attendance marked!");
      } else {
        setMsg(d.error || "Failed");
      }
      fetchAttendance();
    } catch {
      setMsg("Failed to mark attendance");
    }
    setMarking(false);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "present": return "success";
      case "absent": return "destructive";
      case "late": return "warning";
      case "leave": return "secondary";
      default: return "outline";
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const alreadyMarked = data?.todayRecord;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Attendance</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("en", { month: "long" })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Mark Attendance Card */}
      <Card className={`border-2 ${alreadyMarked ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {alreadyMarked ? (
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
                {alreadyMarked ? "Attendance Marked Today" : "Mark Today's Attendance"}
              </p>
              <p className="text-sm text-gray-400">
                {alreadyMarked
                  ? `Marked at ${alreadyMarked.checkInTime} — ${alreadyMarked.status === "late" ? "Late" : "Present"}`
                  : "Click the button to mark your attendance for today"
                }
              </p>
            </div>
          </div>
          {!alreadyMarked ? (
            <Button
              onClick={handleMark}
              disabled={marking}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 h-12 px-8 text-base"
            >
              {marking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              Mark Present
            </Button>
          ) : (
            <Badge variant={alreadyMarked.status === "late" ? "warning" : "success"} className="text-sm px-4 py-1.5">
              {alreadyMarked.status === "late" ? "Late" : "Present"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {msg && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm p-3 rounded-xl">{msg}</div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center p-4 border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-400">Present</p>
          <p className="text-2xl font-bold text-emerald-400">{data?.stats?.totalPresent || 0}</p>
        </Card>
        <Card className="text-center p-4 border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-400">Absent</p>
          <p className="text-2xl font-bold text-red-400">{data?.stats?.totalAbsent || 0}</p>
        </Card>
        <Card className="text-center p-4 border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-400">Late</p>
          <p className="text-2xl font-bold text-amber-400">{data?.stats?.totalLate || 0}</p>
        </Card>
        <Card className="text-center p-4 border-gray-800 bg-gray-900/50">
          <p className="text-sm text-gray-400">Leave</p>
          <p className="text-2xl font-bold text-gray-400">{data?.stats?.totalLeave || 0}</p>
        </Card>
      </div>

      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Check In</TableHead>
                <TableHead className="text-gray-400">Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.records?.length > 0 ? data.records.map((r: any) => (
                <TableRow key={r._id} className="border-gray-800">
                  <TableCell className="text-sm text-white">{formatDate(r.date)}</TableCell>
                  <TableCell><Badge variant={statusColor(r.status)} className="capitalize">{r.status}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-400">{r.checkInTime || "-"}</TableCell>
                  <TableCell className="text-sm text-gray-400">{r.checkOutTime || "-"}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No attendance records for this month</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
