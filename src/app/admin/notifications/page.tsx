"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState({
    title: "", message: "", type: "general", targetAudience: "all", sendEmail: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchNotifications = async () => {
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    setNotifications(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSend = async () => {
    setSaving(true);
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowSend(false);
    fetchNotifications();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button onClick={() => setShowSend(true)}><Bell className="h-4 w-4 mr-2" /> Send Notification</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-gray-500">No notifications sent yet</CardContent></Card>
        ) : notifications.map((n: any) => (
          <Card key={n._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{n.title}</h3>
                    <Badge variant="outline" className="text-xs">{n.type.replace(/_/g, " ")}</Badge>
                    <Badge variant="secondary" className="text-xs">To: {n.targetAudience.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(n.createdAt)} • Sent to {n.recipients?.length || 0} students
                    {n.emailSent && " • Email sent"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Message *</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="fee_reminder">Fee Reminder</SelectItem>
                    <SelectItem value="holiday_notice">Holiday Notice</SelectItem>
                    <SelectItem value="timing_change">Timing Change</SelectItem>
                    <SelectItem value="event_announcement">Event</SelectItem>
                    <SelectItem value="maintenance_notice">Maintenance</SelectItem>
                    <SelectItem value="emergency_notice">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="morning">Morning Shift</SelectItem>
                    <SelectItem value="evening">Evening Shift</SelectItem>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSend} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Send Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
