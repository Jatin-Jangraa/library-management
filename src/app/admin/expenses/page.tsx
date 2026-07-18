"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const categories = ["Rent", "Electricity", "Internet", "Staff Salary", "Cleaning", "Furniture", "Repairs", "Drinking Water", "Stationery", "Marketing", "Other"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0], category: "", amount: 0,
    paymentMethod: "cash", description: "", vendor: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/expenses?month=${month}`);
    const data = await res.json();
    setExpenses(data.data?.expenses || []);
    setTotal(data.data?.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [month]);

  const handleAdd = async () => {
    setSaving(true);
    await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setShowAdd(false);
    fetchExpenses();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex gap-4 items-center">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-48" />
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Expenses ({month})</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : expenses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No expenses recorded</TableCell></TableRow>
              ) : expenses.map((e: any) => (
                <TableRow key={e._id}>
                  <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                  <TableCell><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{e.category}</span></TableCell>
                  <TableCell className="text-sm">{e.description}</TableCell>
                  <TableCell className="text-sm">{e.vendor || "-"}</TableCell>
                  <TableCell className="capitalize text-sm">{e.paymentMethod.replace("_", " ")}</TableCell>
                  <TableCell className="font-semibold text-red-600">{formatCurrency(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
            <Button onClick={handleAdd} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
