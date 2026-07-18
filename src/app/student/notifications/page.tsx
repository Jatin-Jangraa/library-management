"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await fetch("/api/student/notifications");
    const data = await res.json();
    setNotifications(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await fetch("/api/student/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    fetchNotifications();
  };

  const markRead = async (id: string) => {
    await fetch("/api/student/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    fetchNotifications();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead}><Check className="h-4 w-4 mr-2" /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No notifications</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n._id} className={!n.read ? "border-l-4 border-l-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{n.title}</h3>
                      <Badge variant="outline" className="text-xs">{n.type.replace(/_/g, " ")}</Badge>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(n._id)}>Mark read</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
