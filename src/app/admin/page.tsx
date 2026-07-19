"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Armchair, CreditCard, CalendarDays, Key, Eye, EyeOff, Copy, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { config } from "@/lib/config";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  morningShiftOccupancy: number;
  eveningShiftOccupancy: number;
  fullDayOccupancy: number;
  todayAttendance: number;
  monthlyFeeCollection: number;
  onlinePaymentCollection: number;
  offlinePaymentCollection: number;
  monthlyExpenses: number;
  netIncome: number;
  recentPayments: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [credentials, setCredentials] = useState<any[]>([]);
  const [credError, setCredError] = useState("");
  const [credLoading, setCredLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchCredentials = async () => {
    setCredLoading(true);
    setCredError("");
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: securityKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCredError(data.error || "Invalid key");
        setCredLoading(false);
        return;
      }
      setCredentials(data.data || []);
    } catch {
      setCredError("Failed to fetch");
    }
    setCredLoading(false);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-gray-800 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-800 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-800 rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-gray-400">Failed to load dashboard</p>;

  const stats = [
    { title: "Total Students", value: data.totalStudents, icon: Users, color: "text-blue-400" },
    { title: "Active Students", value: data.activeStudents, icon: Users, color: "text-emerald-400" },
    { title: "Total Seats", value: data.totalSeats, icon: Armchair, color: "text-purple-400" },
    { title: "Occupied Seats", value: data.occupiedSeats, icon: Armchair, color: "text-orange-400" },
    { title: "Available Seats", value: data.availableSeats, icon: Armchair, color: "text-emerald-400" },
    { title: "Today Attendance", value: data.todayAttendance, icon: CalendarDays, color: "text-blue-400" },
  ];

  const shiftData = [
    { name: "Morning", value: data.morningShiftOccupancy, fill: "#3b82f6" },
    { name: "Evening", value: data.eveningShiftOccupancy, fill: "#8b5cf6" },
    { name: "Full Day", value: data.fullDayOccupancy, fill: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-800/50">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 mb-1">Monthly Collection</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(data.monthlyFeeCollection)}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(data.monthlyExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-5">
            <p className="text-xs text-gray-400 mb-1">Net Income</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(data.netIncome)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Collection", amount: data.monthlyFeeCollection },
                  { name: "Expenses", amount: data.monthlyExpenses },
                  { name: "Net Income", amount: data.netIncome },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Shift Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shiftData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {shiftData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Online Payments</span>
                <span className="font-semibold text-white">{formatCurrency(data.onlinePaymentCollection)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Offline Payments</span>
                <span className="font-semibold text-white">{formatCurrency(data.offlinePaymentCollection)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                <span className="text-sm font-medium text-gray-300">Net Income</span>
                <span className="font-bold text-emerald-400">{formatCurrency(data.netIncome)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentPayments?.map((payment: any) => (
                <div key={payment._id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{payment.studentId?.name}</p>
                    <p className="text-xs text-gray-500">{payment.method} • {new Date(payment.paymentDate).toLocaleDateString(config.locale)}</p>
                  </div>
                  <span className="font-semibold text-emerald-400">{formatCurrency(payment.finalAmount)}</span>
                </div>
              ))}
              {(!data.recentPayments || data.recentPayments.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Credentials Section */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-400" /> Student Login Credentials
              </h3>
              <p className="text-xs text-gray-500 mt-1">View student login emails and passwords</p>
            </div>
            <Button
              onClick={() => { setShowCredentials(true); setSecurityKey(""); setCredentials([]); setCredError(""); setShowPasswords(false); }}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" /> View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" /> Student Credentials
            </DialogTitle>
          </DialogHeader>

          {credentials.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Enter the security key to view all student login credentials.</p>
              {credError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{credError}</div>
              )}
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter security key"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCredentials()}
                  className="bg-gray-800/50 border-gray-700 text-white h-11"
                />
                <Button onClick={fetchCredentials} disabled={credLoading || !securityKey} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white h-11 px-6">
                  {credLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  Unlock
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{credentials.length} students found</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-gray-400 hover:text-white"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showPasswords ? "Hide" : "Show"} Passwords
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {credentials.map((c: any, i: number) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{c.studentId}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-300 font-mono">{c.email}</p>
                        <p className="text-sm text-amber-400 font-mono">{showPasswords ? c.password : "••••••••"}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${c.email}\n${c.password}`, i)}
                        className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                        title="Copy credentials"
                      >
                        {copiedIdx === i ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
