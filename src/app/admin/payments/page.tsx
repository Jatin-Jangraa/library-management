"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({
    studentId: "", amount: 0, method: "cash", purpose: "monthly_fee", notes: "", discount: 0, paymentDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount), discount: Number(form.discount) }),
    });
    setShowAdd(false);
    fetchPayments();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Button onClick={() => { fetchStudents(); setShowAdd(true); }}><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No payments recorded</TableCell></TableRow>
              ) : payments.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                  <TableCell className="font-medium">{p.studentId?.name}</TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{p.discount > 0 ? formatCurrency(p.discount) : "-"}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(p.finalAmount)}</TableCell>
                  <TableCell className="capitalize text-sm">{p.method.replace("_", " ")}</TableCell>
                  <TableCell className="capitalize text-sm">{p.purpose.replace("_", " ")}</TableCell>
                  <TableCell className="text-sm">{formatDate(p.paymentDate)}</TableCell>
                  <TableCell><Badge variant={p.status === "completed" ? "success" : p.status === "refunded" ? "warning" : "secondary"}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="py-2 px-4 text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Offline Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => <SelectItem key={s.userId._id} value={s.userId._id}>{s.userId.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div><Label>Discount (₹)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purpose</Label>
                <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="monthly_fee">Monthly Fee</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="security_deposit">Security Deposit</SelectItem>
                    <SelectItem value="late_fee">Late Fee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={handleRecordPayment} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
