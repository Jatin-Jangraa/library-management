"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", eventDate: "", startTime: "", endTime: "",
    location: "", targetAudience: "all", isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    fetchEvents();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events & Announcements</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Create Event</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : events.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No events created yet</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event: any) => (
            <Card key={event._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(event.eventDate)} {event.startTime && `${event.startTime} - ${event.endTime}`}</p>
                    <p className="text-sm mt-2 text-gray-600">{event.description}</p>
                    {event.location && <p className="text-xs text-gray-400 mt-2">Location: {event.location}</p>}
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">{event.targetAudience.replace("_", " ")}</span>
                      <span className={`text-xs px-2 py-1 rounded ${event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Date *</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
              <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div>
              <Label>Target Audience</Label>
              <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="morning">Morning Shift</SelectItem>
                  <SelectItem value="evening">Evening Shift</SelectItem>
                  <SelectItem value="full_day">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
