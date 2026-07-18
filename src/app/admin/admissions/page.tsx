"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    studentId: "", planId: "", seatId: "", startDate: new Date().toISOString().split("T")[0],
    initialPayment: 0, securityDepositPaid: false, admissionFeePaid: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [admRes, planRes, studRes, seatRes] = await Promise.all([
      fetch(`/api/admin/admissions?status=${statusFilter}`),
      fetch("/api/admin/plans"),
      fetch("/api/admin/students?limit=100"),
      fetch("/api/admin/seats"),
    ]);
    const admData = await admRes.json();
    const planData = await planRes.json();
    const studData = await studRes.json();
    const seatData = await seatRes.json();
    setAdmissions(admData.data || []);
    setPlans(planData.data || []);
    setStudents(studData.data?.students || []);
    setSeats((seatData.data?.seats || []).filter((s: any) => !s.currentAssignment));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleAdmit = async () => {
    setSaving(true);
    await fetch("/api/admin/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    fetchData();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admissions</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> New Admission</Button>
      </div>

      <div className="flex gap-2">
        {["all", "active", "expired", "paused", "cancelled"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : admissions.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No admissions found</TableCell></TableRow>
              ) : admissions.map((a: any) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">{a.studentId?.name}</TableCell>
                  <TableCell>{a.planId?.name}</TableCell>
                  <TableCell className="capitalize">{a.shiftType?.replace("_", " ")}</TableCell>
                  <TableCell>{a.seatId?.seatNumber || "-"}</TableCell>
                  <TableCell className="text-sm">{formatDate(a.startDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(a.endDate)}</TableCell>
                  <TableCell>{formatCurrency(a.totalAmount)}</TableCell>
                  <TableCell className={a.pendingAmount > 0 ? "text-red-600 font-medium" : ""}>{formatCurrency(a.pendingAmount)}</TableCell>
                  <TableCell><Badge variant={a.status === "active" ? "success" : a.status === "expired" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={(open) => {
        setShowAdd(open);
        if (!open) setForm({ studentId: "", planId: "", seatId: "", startDate: new Date().toISOString().split("T")[0], initialPayment: 0, securityDepositPaid: false, admissionFeePaid: false });
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Admission</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => <SelectItem key={s.userId._id} value={s.userId._id}>{s.userId.name} ({s.studentId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name} - {formatCurrency(p.monthlyFee)}/mo</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.planId && (() => {
              const plan = plans.find((p: any) => p._id === form.planId);
              if (!plan) return null;
              const total = plan.monthlyFee + plan.admissionFee + plan.securityDeposit;
              return (
                <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Monthly Fee</span><span>{formatCurrency(plan.monthlyFee)}</span></div>
                  <div className="flex justify-between"><span>Admission Fee</span><span>{formatCurrency(plan.admissionFee)}</span></div>
                  <div className="flex justify-between"><span>Security Deposit</span><span>{formatCurrency(plan.securityDeposit)}</span></div>
                  <div className="flex justify-between font-medium border-t pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
              );
            })()}
            <div>
              <Label>Seat (optional)</Label>
              <Select value={form.seatId} onValueChange={(v) => setForm({ ...form, seatId: v })}>
                <SelectTrigger><SelectValue placeholder="No seat" /></SelectTrigger>
                <SelectContent>
                  {seats.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.seatNumber}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-500">Initial Payment</p>
              <div><Label>Amount Paid (₹)</Label><Input type="number" min={0} value={form.initialPayment} onChange={(e) => setForm({ ...form, initialPayment: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-3">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.admissionFeePaid} onChange={(e) => setForm({ ...form, admissionFeePaid: e.target.checked })} className="rounded" />
                  Admission Fee Paid
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.securityDepositPaid} onChange={(e) => setForm({ ...form, securityDepositPaid: e.target.checked })} className="rounded" />
                  Security Deposit Paid
                </Label>
              </div>
            </div>

            <Button onClick={handleAdmit} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Process Admission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
