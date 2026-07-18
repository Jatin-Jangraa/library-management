"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/support?status=${statusFilter}` : "/api/admin/support";
    const res = await fetch(url);
    const data = await res.json();
    setTickets(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const handleRespond = async (ticketId: string, status: string) => {
    setUpdating(true);
    await fetch(`/api/admin/support/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminResponse: response, status }),
    });
    setSelectedTicket(null);
    setResponse("");
    fetchTickets();
    setUpdating(false);
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "open": return "destructive";
      case "in_progress": return "warning";
      case "resolved": return "success";
      case "closed": return "secondary";
      default: return "outline";
    }
  };

  const priorityVariant = (p: string) => {
    switch (p) {
      case "high": return "destructive";
      case "medium": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Support Requests</h1>

      <div className="flex gap-2 flex-wrap">
        <Button variant={!statusFilter ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("")}>All</Button>
        {["open", "in_progress", "resolved", "closed"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">{s.replace("_", " ")}</Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No support tickets found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <Card key={ticket._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">{ticket.ticketNumber}</span>
                      <Badge variant={statusVariant(ticket.status)} className="capitalize">{ticket.status.replace("_", " ")}</Badge>
                      <Badge variant={priorityVariant(ticket.priority)} className="capitalize">{ticket.priority}</Badge>
                    </div>
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>By: {ticket.studentId?.name}</span>
                      <span>Category: {ticket.category.replace(/_/g, " ")}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                    {ticket.adminResponse && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">Admin Response:</p>
                        <p className="text-sm">{ticket.adminResponse}</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedTicket(ticket); setResponse(ticket.adminResponse || ""); }}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Respond
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Respond to Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Response</Label>
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Type your response..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleRespond(selectedTicket?._id, "in_progress")} disabled={updating} className="flex-1">
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Mark In Progress
              </Button>
              <Button onClick={() => handleRespond(selectedTicket?._id, "resolved")} disabled={updating} className="flex-1" variant="default">
                Resolve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
