"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Download } from "lucide-react";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/dashboard`);
    const d = await res.json();
    setData(d.data);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(",");
    const csv = rows.map((r) => Object.values(r).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overview", key: "overview" },
          { label: "Financial", key: "financial" },
          { label: "Occupancy", key: "occupancy" },
          { label: "Students", key: "students" },
        ].map((tab) => (
          <Button key={tab.key} variant={activeReport === tab.key ? "default" : "outline"} onClick={() => setActiveReport(tab.key)}>
            {tab.label}
          </Button>
        ))}
      </div>

      {activeReport === "overview" && data && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Monthly Collection Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyCollectionChart?.map((c: any) => ({
                    name: new Date(c._id.year, c._id.month - 1).toLocaleString("en", { month: "short" }),
                    amount: c.total,
                  })).reverse() || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="amount" fill="#3b82f6" name="Collection" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Student Admissions Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.admissionsChart?.map((c: any) => ({
                    name: new Date(c._id.year, c._id.month - 1).toLocaleString("en", { month: "short" }),
                    count: c.count,
                  })).reverse() || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Admissions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Total Students</span><span className="font-bold">{data.totalStudents}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active Students</span><span className="font-bold">{data.activeStudents}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Seats</span><span className="font-bold">{data.totalSeats}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Occupied Seats</span><span className="font-bold">{data.occupiedSeats}</span></div>
              <div className="flex justify-between border-t pt-3"><span className="font-medium">Monthly Collection</span><span className="font-bold text-green-600">{formatCurrency(data.monthlyFeeCollection)}</span></div>
              <div className="flex justify-between"><span className="font-medium">Monthly Expenses</span><span className="font-bold text-red-600">{formatCurrency(data.monthlyExpenses)}</span></div>
              <div className="flex justify-between border-t pt-3"><span className="font-bold">Net Income</span><span className={`font-bold ${data.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(data.netIncome)}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Shift Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Morning Shift</span><span className="font-bold">{data.morningShiftOccupancy} seats</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Evening Shift</span><span className="font-bold">{data.eveningShiftOccupancy} seats</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Full Day</span><span className="font-bold">{data.fullDayOccupancy} seats</span></div>
              <div className="flex justify-between border-t pt-3"><span className="text-gray-500">Online Payments</span><span className="font-bold">{formatCurrency(data.onlinePaymentCollection)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Offline Payments</span><span className="font-bold">{formatCurrency(data.offlinePaymentCollection)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pending Amount</span><span className="font-bold text-red-600">{formatCurrency(data.pendingFeeAmount)}</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeReport === "financial" && data && (
        <Card>
          <CardHeader><CardTitle>Financial Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-green-50 rounded-lg"><p className="text-sm text-gray-500">Total Collection</p><p className="text-2xl font-bold text-green-600">{formatCurrency(data.monthlyFeeCollection)}</p></div>
              <div className="text-center p-6 bg-red-50 rounded-lg"><p className="text-sm text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-red-600">{formatCurrency(data.monthlyExpenses)}</p></div>
              <div className="text-center p-6 bg-blue-50 rounded-lg"><p className="text-sm text-gray-500">Net Income</p><p className={`text-2xl font-bold ${data.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(data.netIncome)}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "occupancy" && data && (
        <Card>
          <CardHeader><CardTitle>Seat Occupancy Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded"><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{data.totalSeats}</p></div>
              <div className="text-center p-4 bg-red-50 rounded"><p className="text-sm text-gray-500">Occupied</p><p className="text-xl font-bold">{data.occupiedSeats}</p></div>
              <div className="text-center p-4 bg-green-50 rounded"><p className="text-sm text-gray-500">Available</p><p className="text-xl font-bold">{data.availableSeats}</p></div>
              <div className="text-center p-4 bg-blue-50 rounded"><p className="text-sm text-gray-500">Occupancy Rate</p><p className="text-xl font-bold">{data.totalSeats > 0 ? Math.round((data.occupiedSeats / data.totalSeats) * 100) : 0}%</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "students" && data && (
        <Card>
          <CardHeader><CardTitle>Student Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded"><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{data.totalStudents}</p></div>
              <div className="text-center p-4 bg-green-50 rounded"><p className="text-sm text-gray-500">Active</p><p className="text-xl font-bold">{data.activeStudents}</p></div>
              <div className="text-center p-4 bg-red-50 rounded"><p className="text-sm text-gray-500">Expired</p><p className="text-xl font-bold">{data.expiredStudents}</p></div>
              <div className="text-center p-4 bg-yellow-50 rounded"><p className="text-sm text-gray-500">Pending Fees</p><p className="text-xl font-bold">{data.pendingFeesStudents}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
