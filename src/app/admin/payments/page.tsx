"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    method: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPayments = async () => {
    const res = await fetch(`/api/admin/payments?page=${page}&limit=15`);
    const data = await res.json();
    setPayments(data.data?.payments || []);
    setTotalPages(data.data?.pagination?.totalPages || 1);
    setLoading(false);
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/admin/students?limit=100");
    const data = await res.json();
    setStudents(data.data?.students || []);
  };

  useEffect(() => { fetchPayments(); }, [page]);

  const handleRecordPayment = async () => {
    if (!form.studentId || !form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          amount: Number(form.amount),
          method: form.method,
          purpose: "monthly_fee",
          paymentDate: form.paymentDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setForm({ studentId: "", amount: "", method: "cash", paymentDate: new Date().toISOString().split("T")[0] });
        setSuccessMsg("Payment recorded!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchPayments();
      }
    } catch {}
    setSaving(false);
  };

  const totalCollected = payments.reduce((sum: number, p: any) => sum + (p.finalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Record and view all payments</p>
        </div>
        <Button onClick={() => { fetchStudents(); setShowAdd(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-11 px-5">
          <Plus className="h-4 w-4 mr-2" /> Record Payment
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
        </div>
      )}

      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Page</p>
              <p className="text-2xl font-bold text-white">{page} / {totalPages}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Shown Total</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No payments recorded</TableCell></TableRow>
              ) : payments.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs text-gray-300">{p.receiptNumber}</TableCell>
                  <TableCell className="font-medium text-white">{p.studentId?.name}</TableCell>
                  <TableCell className="font-semibold text-emerald-400">{formatCurrency(p.finalAmount)}</TableCell>
                  <TableCell className="capitalize text-sm text-gray-300">{p.method.replace("_", " ")}</TableCell>
                  <TableCell className="text-sm text-gray-400">{formatDate(p.paymentDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-gray-700 text-gray-300">Previous</Button>
          <span className="py-2 px-4 text-sm text-gray-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-gray-700 text-gray-300">Next</Button>
        </div>
      )}

      {/* Record Payment Dialog - Simple */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <DialogHeader><DialogTitle className="text-white text-xl">Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {students.map((s: any) => <SelectItem key={s.userId._id} value={s.userId._id} className="text-white">{s.userId.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Amount (₹) *</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" className="bg-gray-800/50 border-gray-700 text-white h-11" />
            </div>
            <div>
              <Label className="text-gray-300">Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="cash" className="text-white">Cash</SelectItem>
                  <SelectItem value="upi" className="text-white">UPI</SelectItem>
                  <SelectItem value="bank_transfer" className="text-white">Bank Transfer</SelectItem>
                  <SelectItem value="online" className="text-white">Online</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Payment Date</Label>
              <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" />
            </div>
            <Button onClick={handleRecordPayment} disabled={saving || !form.studentId || !form.amount} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
