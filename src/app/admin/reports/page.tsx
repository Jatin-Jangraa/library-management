"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/dashboard`);
    const d = await res.json();
    setData(d.data);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reports</h1>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Overview", key: "overview" },
          { label: "Financial", key: "financial" },
          { label: "Occupancy", key: "occupancy" },
          { label: "Students", key: "students" },
        ].map((tab) => (
          <Button key={tab.key} variant={activeReport === tab.key ? "default" : "outline"} onClick={() => setActiveReport(tab.key)} className={activeReport === tab.key ? "" : "border-gray-700 text-gray-300"}>
            {tab.label}
          </Button>
        ))}
      </div>

      {activeReport === "overview" && data && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader><CardTitle className="text-lg text-white">Monthly Collection</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyCollectionChart?.map((c: any) => ({
                    name: new Date(c._id.year, c._id.month - 1).toLocaleString("en", { month: "short" }),
                    amount: c.total,
                  })).reverse() || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" name="Collection" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader><CardTitle className="text-lg text-white">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Total Students</span><span className="font-bold text-white">{data.totalStudents}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Active Students</span><span className="font-bold text-white">{data.activeStudents}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Seats</span><span className="font-bold text-white">{data.totalSeats}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Occupied Seats</span><span className="font-bold text-white">{data.occupiedSeats}</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-3"><span className="font-medium text-gray-300">Monthly Collection</span><span className="font-bold text-emerald-400">{formatCurrency(data.monthlyFeeCollection)}</span></div>
              <div className="flex justify-between"><span className="font-medium text-gray-300">Monthly Expenses</span><span className="font-bold text-red-400">{formatCurrency(data.monthlyExpenses)}</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-3"><span className="font-bold text-gray-300">Net Income</span><span className={`font-bold ${data.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(data.netIncome)}</span></div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader><CardTitle className="text-lg text-white">Shift Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Morning Shift</span><span className="font-bold text-white">{data.morningShiftOccupancy} seats</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Evening Shift</span><span className="font-bold text-white">{data.eveningShiftOccupancy} seats</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Full Day</span><span className="font-bold text-white">{data.fullDayOccupancy} seats</span></div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader><CardTitle className="text-lg text-white">Payment Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Online Payments</span><span className="font-bold text-white">{formatCurrency(data.onlinePaymentCollection)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Offline Payments</span><span className="font-bold text-white">{formatCurrency(data.offlinePaymentCollection)}</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeReport === "financial" && data && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Financial Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><p className="text-sm text-gray-400">Total Collection</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(data.monthlyFeeCollection)}</p></div>
              <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-sm text-gray-400">Total Expenses</p><p className="text-2xl font-bold text-red-400">{formatCurrency(data.monthlyExpenses)}</p></div>
              <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg"><p className="text-sm text-gray-400">Net Income</p><p className={`text-2xl font-bold ${data.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(data.netIncome)}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "occupancy" && data && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Seat Occupancy</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg"><p className="text-sm text-gray-400">Total</p><p className="text-xl font-bold text-white">{data.totalSeats}</p></div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg"><p className="text-sm text-gray-400">Occupied</p><p className="text-xl font-bold text-red-400">{data.occupiedSeats}</p></div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-lg"><p className="text-sm text-gray-400">Available</p><p className="text-xl font-bold text-emerald-400">{data.availableSeats}</p></div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg"><p className="text-sm text-gray-400">Rate</p><p className="text-xl font-bold text-blue-400">{data.totalSeats > 0 ? Math.round((data.occupiedSeats / data.totalSeats) * 100) : 0}%</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "students" && data && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-white">Student Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg"><p className="text-sm text-gray-400">Total</p><p className="text-xl font-bold text-blue-400">{data.totalStudents}</p></div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-lg"><p className="text-sm text-gray-400">Active</p><p className="text-xl font-bold text-emerald-400">{data.activeStudents}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
