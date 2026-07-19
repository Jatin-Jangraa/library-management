"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Eye, Trash2, Loader2, AlertCircle, Users, CheckCircle,
  Armchair,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const emptyStudent = {
    name: "", email: "", phone: "",
    fatherName: "", address: "", course: "", gender: "",
  };
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const fetchStudents = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/students?search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=20`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load students");
        setStudents([]);
      } else {
        setStudents(data.data?.students || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
    } catch {
      setErrorMsg("Failed to load students");
      setStudents([]);
    }
    setLoading(false);
  };

  const fetchMeta = async () => {
    const seatRes = await fetch("/api/admin/seats");
    const seatData = await seatRes.json();
    setSeats((seatData.data?.seats || []).filter((s: any) => !s.currentAssignment));
  };

  useEffect(() => { fetchStudents(); }, [debouncedSearch, page]);
  useEffect(() => { fetchMeta(); }, []);

  const handleAddStudent = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to add student");
        setSaving(false);
        return;
      }

      const pwd = data.data?.generatedPassword;
      if (pwd) setGeneratedPassword(pwd);

      setShowAddDialog(false);
      setStudentForm(emptyStudent);
      setSuccessMsg(pwd ? `Student added! Password: ${pwd}` : "Student added successfully!");
      setTimeout(() => setSuccessMsg(""), 8000);
      fetchStudents();
      fetchMeta();
    } catch {
      setErrorMsg("Failed to add student");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name} and ALL their data?\n\nThis cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Student deleted permanently");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchStudents();
        fetchMeta();
      } else {
        setErrorMsg(data.error || "Failed to delete");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch {
      setErrorMsg("Failed to delete student");
    }
  };

  const handleView = async (student: any) => {
    try {
      const res = await fetch(`/api/admin/students/${student.userId._id}`);
      const data = await res.json();
      setSelectedStudent(data.data);
      setShowViewDialog(true);
    } catch {}
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.currentMembership?.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Manage students and memberships</p>
        </div>
        <Button
          onClick={() => { setShowAddDialog(true); fetchMeta(); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-base px-6 py-5"
        >
          <Plus className="h-5 w-5 mr-2" /> Add New Student
        </Button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
          {generatedPassword && (
            <>
              <button onClick={() => navigator.clipboard.writeText(generatedPassword)} className="ml-2 underline hover:no-underline">Copy Password</button>
              <button onClick={() => { setSuccessMsg(""); setGeneratedPassword(""); }} className="ml-auto text-emerald-400/60 hover:text-emerald-400">&times;</button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
            <p className="text-xs text-gray-400">Total Students</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400">{activeStudents}</p>
            <p className="text-xs text-gray-400">Active Members</p>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-4 text-center">
            <Armchair className="h-6 w-6 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold text-purple-400">{seats.length}</p>
            <p className="text-xs text-gray-400">Free Seats</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600 h-11"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : students.length === 0 ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No students found</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add First Student
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((s: any) => {
            const m = s.currentMembership;
            const isActive = m?.status === "active";
            return (
              <Card key={s._id} className="border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {s.userId?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-lg">{s.userId?.name}</h3>
                          <Badge variant={isActive ? "success" : m ? "destructive" : "secondary"} className="text-xs">
                            {isActive ? "Active" : m ? m.status : "No Plan"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{s.userId?.email} &middot; {s.userId?.phone}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="font-mono">{s.studentId}</span>
                          {m?.planId?.name && <span>&middot; {m.planId.name}</span>}
                          {m?.seatId?.seatNumber && <span>&middot; Seat {m.seatId.seatNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="lg" onClick={() => handleView(s)} className="border-gray-700 text-gray-300 hover:text-white px-5">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => handleDelete(s.userId._id, s.userId.name)} className="border-gray-700 text-red-400 hover:bg-red-500/10 px-5">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-gray-700 text-gray-300">Previous</Button>
          <span className="py-2 px-4 text-sm text-gray-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-gray-700 text-gray-300">Next</Button>
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setStudentForm(emptyStudent);
          setErrorMsg("");
          setGeneratedPassword("");
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <p className="text-sm text-gray-400">A unique password will be automatically generated.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label className="text-gray-300">Full Name *</Label><Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
              <div><Label className="text-gray-300">Email *</Label><Input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
              <div><Label className="text-gray-300">Phone *</Label><Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
              <div><Label className="text-gray-300">Father&apos;s Name</Label><Input value={studentForm.fatherName} onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
              <div>
                <Label className="text-gray-300">Gender</Label>
                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="male" className="text-white">Male</SelectItem>
                    <SelectItem value="female" className="text-white">Female</SelectItem>
                    <SelectItem value="other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label className="text-gray-300">Course / Exam</Label><Input value={studentForm.course} onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white h-11" /></div>
            </div>

            <Button onClick={handleAddStudent} disabled={saving || !studentForm.name || !studentForm.email || !studentForm.phone} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base">
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Add Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedStudent.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedStudent.user?.name}</h2>
                  <p className="text-sm text-gray-400 font-mono">{selectedStudent.profile?.studentId}</p>
                </div>
                <Badge variant={selectedStudent.user?.isActive ? "success" : "destructive"} className="ml-auto">
                  {selectedStudent.user?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-800/30 rounded-xl p-4">
                <div><p className="text-xs text-gray-500">Email</p><p className="text-sm text-white">{selectedStudent.user?.email}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm text-white">{selectedStudent.user?.phone}</p></div>
                <div><p className="text-xs text-gray-500">Course</p><p className="text-sm text-white">{selectedStudent.profile?.course || "-"}</p></div>
                <div><p className="text-xs text-gray-500">Father&apos;s Name</p><p className="text-sm text-white">{selectedStudent.profile?.fatherName || "-"}</p></div>
              </div>

              {selectedStudent.activeMembership && (
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="font-semibold mb-3 text-white">Current Membership</h3>
                  <div className="bg-gray-800/30 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Plan</p><p className="text-white font-medium">{selectedStudent.activeMembership.planId?.name}</p></div>
                    <div><p className="text-xs text-gray-500">Shift</p><p className="text-white capitalize">{selectedStudent.activeMembership.shiftType?.replace("_", " ")}</p></div>
                    <div><p className="text-xs text-gray-500">Seat</p><p className="text-white">{selectedStudent.activeMembership.seatId?.seatNumber || "Not assigned"}</p></div>
                    <div><p className="text-xs text-gray-500">Expires</p><p className="text-white">{formatDate(selectedStudent.activeMembership.endDate)}</p></div>
                  </div>
                </div>
              )}

              {selectedStudent.payments?.length > 0 && (
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="font-semibold mb-3 text-white">Recent Payments</h3>
                  <div className="space-y-2">
                    {selectedStudent.payments.map((p: any) => (
                      <div key={p._id} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
                        <div>
                          <p className="text-sm text-white">{formatCurrency(p.finalAmount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(p.paymentDate)} &middot; {p.method}</p>
                        </div>
                        <span className="font-mono text-xs text-gray-500">{p.receiptNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
