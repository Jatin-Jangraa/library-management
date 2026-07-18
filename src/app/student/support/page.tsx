"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ category: "other", subject: "", description: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const fetchTickets = async () => {
    const res = await fetch("/api/student/support");
    const data = await res.json();
    setTickets(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    await fetch("/api/student/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowNew(false);
    setForm({ category: "other", subject: "", description: "", priority: "medium" });
    fetchTickets();
    setSaving(false);
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "open": return "destructive";
      case "in_progress": return "warning";
      case "resolved": return "success";
      default: return "secondary";
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support Requests</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </div>

      {tickets.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500">No support requests yet</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <Card key={t._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">{t.ticketNumber}</span>
                      <Badge variant={statusVariant(t.status)} className="capitalize">{t.status.replace("_", " ")}</Badge>
                    </div>
                    <h3 className="font-semibold">{t.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(t.createdAt)}</p>
                    {t.adminResponse && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">Admin Response:</p>
                        <p className="text-sm">{t.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Support Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seat_problem">Seat Problem</SelectItem>
                  <SelectItem value="wifi_issue">WiFi Issue</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="membership_issue">Membership Issue</SelectItem>
                  <SelectItem value="change_seat">Change Seat</SelectItem>
                  <SelectItem value="change_shift">Change Shift</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
