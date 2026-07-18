"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm = {
    name: "", description: "", shiftType: "full_day", startTime: "", endTime: "",
    monthlyFee: "", admissionFee: "", securityDeposit: "", duration: "",
    durationUnit: "months", gracePeriod: "", lateFee: "", facilities: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEdit = (plan: any) => {
    setEditingId(plan._id);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      shiftType: plan.shiftType || "full_day",
      startTime: plan.startTime || "",
      endTime: plan.endTime || "",
      monthlyFee: String(plan.monthlyFee || ""),
      admissionFee: String(plan.admissionFee || ""),
      securityDeposit: String(plan.securityDeposit || ""),
      duration: String(plan.duration || ""),
      durationUnit: plan.durationUnit || "months",
      gracePeriod: String(plan.gracePeriod || ""),
      lateFee: String(plan.lateFee || ""),
      facilities: (plan.facilities || []).join(", "),
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      monthlyFee: Number(formData.monthlyFee),
      admissionFee: Number(formData.admissionFee),
      securityDeposit: Number(formData.securityDeposit),
      duration: Number(formData.duration),
      gracePeriod: Number(formData.gracePeriod),
      lateFee: Number(formData.lateFee),
      facilities: formData.facilities.split(",").map((f) => f.trim()).filter(Boolean),
    };

    if (editingId) {
      await fetch(`/api/admin/plans/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowAdd(false);
    setEditingId(null);
    setFormData(emptyForm);
    fetchPlans();
    setSaving(false);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const action = currentActive ? "Deactivate" : "Reactivate";
    if (!confirm(`${action} this plan?`)) return;
    await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    fetchPlans();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plans & Shifts</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Create Plan</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className={!plan.isActive ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500 capitalize mt-1">{plan.shiftType.replace("_", " ")} {plan.startTime && `(${plan.startTime} - ${plan.endTime})`}</p>
                </div>
                <Badge variant={plan.isActive ? "success" : "secondary"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-3 border rounded-lg">
                <span className="text-3xl font-bold text-primary">{formatCurrency(plan.monthlyFee)}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Admission Fee</span><span>{formatCurrency(plan.admissionFee)}</span></div>
                <div className="flex justify-between"><span>Security Deposit</span><span>{formatCurrency(plan.securityDeposit)}</span></div>
                <div className="flex justify-between"><span>Duration</span><span>{plan.duration} {plan.durationUnit}</span></div>
                {plan.lateFee > 0 && <div className="flex justify-between"><span>Late Fee</span><span>{formatCurrency(plan.lateFee)}</span></div>}
              </div>
              {plan.facilities?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {plan.facilities.map((f: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleActive(plan._id, plan.isActive)}>
                  {plan.isActive ? <><Trash2 className="h-4 w-4 mr-1" /> Deactivate</> : <><Plus className="h-4 w-4 mr-1" /> Reactivate</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) { setEditingId(null); setFormData(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Plan" : "Create New Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Plan Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div>
              <Label>Shift Type *</Label>
              <Select value={formData.shiftType} onValueChange={(v) => setFormData({ ...formData, shiftType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.shiftType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
                <div><Label>End Time</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Monthly Fee (₹) *</Label><Input type="number" value={formData.monthlyFee} onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })} /></div>
              <div><Label>Admission Fee (₹)</Label><Input type="number" value={formData.admissionFee} onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })} /></div>
              <div><Label>Security Deposit (₹)</Label><Input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })} /></div>
              <div><Label>Duration *</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
              <div>
                <Label>Duration Unit</Label>
                <Select value={formData.durationUnit} onValueChange={(v) => setFormData({ ...formData, durationUnit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Late Fee (₹)</Label><Input type="number" value={formData.lateFee} onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })} /></div>
            </div>
            <div><Label>Facilities (comma separated)</Label><Input placeholder="WiFi, AC, Power backup" value={formData.facilities} onChange={(e) => setFormData({ ...formData, facilities: e.target.value })} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingId ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
