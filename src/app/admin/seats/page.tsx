"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, Layers, CheckCircle, Armchair, UserMinus } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-emerald-500",
  occupied: "bg-red-500",
  reserved: "bg-amber-500",
  disabled: "bg-gray-400",
  maintenance: "bg-orange-500",
};

const statusBg: Record<string, string> = {
  available: "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400",
  occupied: "border-red-500/30 bg-red-500/10 hover:border-red-400",
  reserved: "border-amber-500/30 bg-amber-500/10 hover:border-amber-400",
  disabled: "border-gray-500/30 bg-gray-500/10",
  maintenance: "border-orange-500/30 bg-orange-500/10 hover:border-orange-400",
};

export default function SeatsPage() {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSeat, setShowAddSeat] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [seatForm, setSeatForm] = useState({ seatNumber: "" });
  const [bulkForm, setBulkForm] = useState({ prefix: "", startNumber: "1", count: "1" });
  const [assignForm, setAssignForm] = useState({ studentId: "", planId: "" });
  const [students, setStudents] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSeatInfo, setShowSeatInfo] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/seats");
      const data = await res.json();
      setSeats(data.data?.seats || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchStudents = async () => {
    const res = await fetch("/api/admin/students?limit=100");
    const data = await res.json();
    setStudents(data.data?.students || []);
  };

  const fetchPlans = async () => {
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.data || []);
  };

  const resetAssignForm = () => {
    setAssignForm({ studentId: "", planId: "" });
  };

  const handleAddSeat = async () => {
    if (!seatForm.seatNumber) return;
    setAddLoading(true);
    try {
      await fetch("/api/admin/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...seatForm, type: "seat" }),
      });
      setShowAddSeat(false);
      setSeatForm({ seatNumber: "" });
      setSuccessMsg("Seat added!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch {}
    setAddLoading(false);
  };

  const handleBulkAdd = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bulk",
          prefix: bulkForm.prefix,
          startNumber: parseInt(bulkForm.startNumber) || 1,
          count: parseInt(bulkForm.count) || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        let msg = `${data.data?.count || 0} seats created!`;
        if (data.data?.duplicates?.length > 0) msg += ` (${data.data.duplicates.length} skipped)`;
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
      setShowBulkAdd(false);
      setBulkForm({ prefix: "", startNumber: "1", count: "1" });
      fetchData();
    } catch {}
    setBulkLoading(false);
  };

  const handleAssign = async () => {
    setErrorMsg("");
    if (!selectedSeat || !assignForm.studentId || !assignForm.planId) return;
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/seats/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: selectedSeat._id, studentId: assignForm.studentId, planId: assignForm.planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to assign");
        setAssignLoading(false);
        return;
      }
      setShowAssign(false);
      setSelectedSeat(null);
      resetAssignForm();
      setSuccessMsg(`Seat ${selectedSeat.seatNumber} assigned!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch {
      setErrorMsg("Failed to assign seat");
    }
    setAssignLoading(false);
  };

  const handleRelease = async (seat: any) => {
    setReleaseLoading(true);
    try {
      const res = await fetch(`/api/admin/seats/assign?seatId=${seat._id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg(`Seat ${seat.seatNumber} released`);
        setTimeout(() => setSuccessMsg(""), 3000);
        setShowSeatInfo(false);
        setSelectedSeat(null);
        fetchData();
      }
    } catch {}
    setReleaseLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === "available").length;
  const occupiedSeats = seats.filter((s) => s.status === "occupied").length;

  const assignedStudentIds = new Set(
    seats
      .filter((s) => s.currentAssignment?.studentId?._id)
      .map((s) => s.currentAssignment.studentId._id.toString())
  );
  const availableStudents = students.filter((s: any) => s.userId && !assignedStudentIds.has(s.userId._id.toString()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Seats</h1>
          <p className="text-gray-400 text-sm mt-1">Click a seat to view info or assign</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowAddSeat(true); resetAssignForm(); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-11 px-5">
            <Plus className="h-4 w-4 mr-2" /> Add Seat
          </Button>
          <Button onClick={() => setShowBulkAdd(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg h-11 px-5">
            <Layers className="h-4 w-4 mr-2" /> Bulk Add
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <Trash2 className="h-4 w-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalSeats}</p>
            <p className="text-xs text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{availableSeats}</p>
            <p className="text-xs text-gray-400">Available</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{occupiedSeats}</p>
            <p className="text-xs text-gray-400">Occupied</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Available</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Occupied</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Maintenance</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400" /> Disabled</div>
      </div>

      {seats.length > 0 ? (
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {seats.map((seat) => (
            <button
              key={seat._id}
              onClick={() => {
                if (seat.status === "available") {
                  setSelectedSeat(seat);
                  resetAssignForm();
                  fetchStudents();
                  fetchPlans();
                  setErrorMsg("");
                  setShowAssign(true);
                } else if (seat.status === "occupied") {
                  setSelectedSeat(seat);
                  setShowSeatInfo(true);
                }
              }}
              className={`relative p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg ${statusBg[seat.status]} ${
                seat.status === "available" || seat.status === "occupied" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${statusColors[seat.status]}`} />
              <p className="text-xs font-bold text-white">{seat.seatNumber}</p>
              {seat.currentAssignment && (
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{seat.currentAssignment.studentId?.name}</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-12 text-center">
            <Armchair className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-4">No seats yet</p>
            <Button onClick={() => setShowBulkAdd(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white h-11 px-6">
              <Layers className="h-4 w-4 mr-2" /> Create Seats in Bulk
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Single Seat Dialog */}
      <Dialog open={showAddSeat} onOpenChange={setShowAddSeat}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader><DialogTitle className="text-white text-xl">Add Seat</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-300">Seat Number *</Label><Input value={seatForm.seatNumber} onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })} placeholder="e.g. A1, 101" className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
            <Button onClick={handleAddSeat} disabled={addLoading || !seatForm.seatNumber} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12">
              {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Seat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Seats Dialog */}
      <Dialog open={showBulkAdd} onOpenChange={setShowBulkAdd}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader><DialogTitle className="text-white text-xl">Bulk Add Seats</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-300">Prefix (optional)</Label><Input value={bulkForm.prefix} onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })} placeholder="e.g. A, B" className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-300">Start Number</Label><Input type="number" value={bulkForm.startNumber} onChange={(e) => setBulkForm({ ...bulkForm, startNumber: e.target.value })} min="1" className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
              <div><Label className="text-gray-300">How Many?</Label><Input type="number" value={bulkForm.count} onChange={(e) => setBulkForm({ ...bulkForm, count: e.target.value })} min="1" max="100" className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
              Creates: <span className="text-white font-mono">
                {bulkForm.prefix || ""}{bulkForm.startNumber || "1"}
                {parseInt(bulkForm.count) > 1 ? ` – ${bulkForm.prefix || ""}${(parseInt(bulkForm.startNumber) || 1) + (parseInt(bulkForm.count) || 1) - 1}` : ""}
              </span>
            </div>
            <Button onClick={handleBulkAdd} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white h-12" disabled={bulkLoading}>
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Layers className="h-4 w-4 mr-2" />}
              Create {bulkForm.count || 0} Seats
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Seat Dialog */}
      <Dialog open={showAssign} onOpenChange={(open) => { setShowAssign(open); if (!open) { setSelectedSeat(null); resetAssignForm(); setErrorMsg(""); } }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Assign Seat {selectedSeat?.seatNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{errorMsg}</div>
            )}
            <div>
              <Label className="text-gray-300">Student</Label>
              <Select value={assignForm.studentId} onValueChange={(v) => setAssignForm({ ...assignForm, studentId: v })}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11"><SelectValue placeholder="Pick a student" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {availableStudents.map((s: any) => <SelectItem key={s.userId._id} value={s.userId._id} className="text-white">{s.userId.name} ({s.studentId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Membership Plan</Label>
              <Select value={assignForm.planId} onValueChange={(v) => setAssignForm({ ...assignForm, planId: v })}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {plans.map((p: any) => (
                    <SelectItem key={p._id} value={p._id} className="text-white">{p.name} — ₹{p.monthlyFee}/mo ({p.duration} {p.durationUnit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssign} disabled={assignLoading || !assignForm.studentId || !assignForm.planId} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 text-base">
              {assignLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Assign Seat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seat Info Dialog - Simple: just student info + release */}
      <Dialog open={showSeatInfo} onOpenChange={(open) => { setShowSeatInfo(open); if (!open) { setSelectedSeat(null); } }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <span className="text-red-400 font-bold text-sm">{selectedSeat?.seatNumber}</span>
              </div>
              Seat {selectedSeat?.seatNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedSeat?.currentAssignment && (() => {
            const a = selectedSeat.currentAssignment;
            const endDate = new Date(a.endDate);
            const now = new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const isExpired = daysLeft === 0;

            return (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {a.studentId?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{a.studentId?.name}</p>
                      <p className="text-xs text-gray-400">{a.studentId?.email}</p>
                      {a.studentId?.phone && <p className="text-xs text-gray-500">{a.studentId?.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-gray-800/30 rounded-xl p-4 space-y-3 border border-gray-700/30">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Shift</p>
                      <p className="text-white capitalize font-medium">{a.shiftType?.replace("_", " ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Days Left</p>
                      <p className={`font-medium ${isExpired ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
                        {isExpired ? "Expired" : `${daysLeft} days`}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Valid Period</p>
                      <p className="text-white">{new Date(a.startDate).toLocaleDateString()} – {endDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Release */}
                <Button
                  variant="destructive"
                  className="w-full h-11"
                  disabled={releaseLoading}
                  onClick={() => handleRelease(selectedSeat)}
                >
                  {releaseLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserMinus className="h-4 w-4 mr-2" />}
                  Release This Seat
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
