"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CalendarDays } from "lucide-react";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/content")
      .then((r) => r.json())
      .then((d) => { setEvents(d.data?.upcomingEvents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Events & Announcements</h1>

      {events.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No upcoming events</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {events.map((event: any) => (
            <Card key={event._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-lg p-3 text-center min-w-[60px]">
                    <p className="text-2xl font-bold">{new Date(event.eventDate).getDate()}</p>
                    <p className="text-xs">{new Date(event.eventDate).toLocaleString("en", { month: "short" })}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.startTime && <p className="text-sm text-gray-500">{event.startTime} - {event.endTime}</p>}
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    {event.location && <p className="text-xs text-gray-400 mt-2">Location: {event.location}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
