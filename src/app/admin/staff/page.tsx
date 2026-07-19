"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Trash2 } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    canMarkAttendance: false, canAddStudents: false, canCollectFees: false,
    canViewSeats: true, canSendNotifications: false, canViewReports: false,
  });
  const [saving, setSaving] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const fetchStaff = async () => {
    const res = await fetch("/api/admin/staff");
    const data = await res.json();
    setStaff(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, phone: form.phone,
        permissions: {
          canMarkAttendance: form.canMarkAttendance, canAddStudents: form.canAddStudents,
          canCollectFees: form.canCollectFees, canViewSeats: form.canViewSeats,
          canSendNotifications: form.canSendNotifications, canViewReports: form.canViewReports,
        },
      }),
    });
    const data = await res.json();
    if (data.data?.generatedPassword) setGeneratedPassword(data.data.generatedPassword);
    setShowAdd(false);
    fetchStaff();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={() => { setShowAdd(true); setGeneratedPassword(""); }}><Plus className="h-4 w-4 mr-2" /> Add Staff</Button>
      </div>

      {generatedPassword && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <span className="font-medium">Staff created!</span> Password: <code className="bg-emerald-500/10 px-2 py-0.5 rounded font-mono">{generatedPassword}</code>
          <button onClick={() => navigator.clipboard.writeText(generatedPassword)} className="ml-2 underline hover:no-underline">Copy</button>
          <button onClick={() => setGeneratedPassword("")} className="ml-auto text-emerald-400/60 hover:text-emerald-400">&times;</button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : staff.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No staff members</TableCell></TableRow>
              ) : staff.map((s: any) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm">{s.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.staffPermissions?.canMarkAttendance && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Attendance</span>}
                      {s.staffPermissions?.canAddStudents && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Add Students</span>}
                      {s.staffPermissions?.canCollectFees && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Fees</span>}
                      {s.staffPermissions?.canSendNotifications && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Notify</span>}
                      {s.staffPermissions?.canViewReports && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Reports</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">A unique password will be automatically generated for the new staff member.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="col-span-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "canMarkAttendance", label: "Mark Attendance" },
                  { key: "canAddStudents", label: "Add Students" },
                  { key: "canCollectFees", label: "Collect Fees" },
                  { key: "canViewSeats", label: "View Seats" },
                  { key: "canSendNotifications", label: "Send Notifications" },
                  { key: "canViewReports", label: "View Reports" },
                ].map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={(form as any)[p.key]} onChange={(e) => setForm({ ...form, [p.key]: e.target.checked })} className="rounded" />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Staff Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
