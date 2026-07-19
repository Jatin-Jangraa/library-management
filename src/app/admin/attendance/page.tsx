"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { config } from "@/lib/config";

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, attRes] = await Promise.all([
        fetch("/api/admin/students?limit=100"),
        fetch(`/api/admin/attendance?date=${date}`),
      ]);
      const stuData = await stuRes.json();
      const attData = await attRes.json();
      setStudents(stuData.data?.students || []);
      const recordMap: Record<string, string> = {};
      (attData.data || []).forEach((r: any) => {
        recordMap[r.studentId?._id || r.studentId] = r.status;
      });
      setRecords(recordMap);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsArray = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records: recordsArray }),
      });
      alert("Attendance saved!");
    } catch {
      alert("Failed to save attendance");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex gap-4 items-center">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Attendance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mark Attendance - {new Date(date + "T00:00:00").toLocaleDateString(config.locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No active students found</TableCell></TableRow>
              ) : students.map((s: any) => (
                <TableRow key={s.userId._id}>
                  <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                  <TableCell className="font-medium">{s.userId?.name}</TableCell>
                  <TableCell className="capitalize text-sm">{s.currentMembership?.shiftType?.replace("_", " ") || "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={records[s.userId._id] || ""}
                      onValueChange={(v) => setRecords({ ...records, [s.userId._id]: v })}
                    >
                      <SelectTrigger className="w-36"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="leave">Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
