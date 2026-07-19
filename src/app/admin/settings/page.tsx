"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { config } from "@/lib/config";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { setSettings(d.data); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...settings,
      membershipExpiryGraceDays: Number(settings.membershipExpiryGraceDays) || 0,
    };
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    alert("Settings saved!");
  };

  if (loading || !settings) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Library Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Library Name</Label><Input value={settings.libraryName || ""} onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })} /></div>
            <div><Label>Logo URL</Label><Input value={settings.logo || ""} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} /></div>
            <div><Label>Contact Phone</Label><Input value={settings.contactPhone || ""} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
            <div><Label>Contact Email</Label><Input value={settings.contactEmail || ""} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
            <div><Label>WhatsApp Number</Label><Input value={settings.whatsappNumber || ""} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} /></div>
            <div><Label>Google Maps URL</Label><Input value={settings.googleMapsUrl || ""} onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })} /></div>
          </div>
          <div><Label>Address</Label><Textarea value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
          <div><Label>Hero Heading</Label><Input value={settings.heroHeading || ""} onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })} /></div>
          <div><Label>Hero Description</Label><Textarea value={settings.heroDescription || ""} onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })} /></div>
          <div><Label>About Content</Label><Textarea value={settings.aboutContent || ""} onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })} rows={4} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Library Timings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Open Time</Label><Input type="time" value={settings.libraryTimings?.openTime || ""} onChange={(e) => setSettings({ ...settings, libraryTimings: { ...settings.libraryTimings, openTime: e.target.value } })} /></div>
            <div><Label>Close Time</Label><Input type="time" value={settings.libraryTimings?.closeTime || ""} onChange={(e) => setSettings({ ...settings, libraryTimings: { ...settings.libraryTimings, closeTime: e.target.value } })} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.seatSharingEnabled || false} onChange={(e) => setSettings({ ...settings, seatSharingEnabled: e.target.checked })} className="rounded" />
            <span className="text-sm">Enable seat sharing between shifts</span>
          </label>
          <div className="max-w-xs"><Label>Expiry Grace Days</Label><Input type="number" value={settings.membershipExpiryGraceDays || ""} onChange={(e) => setSettings({ ...settings, membershipExpiryGraceDays: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ID Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Student ID Prefix</Label><Input value={settings.studentIdPrefix || config.prefixes.studentId} onChange={(e) => setSettings({ ...settings, studentIdPrefix: e.target.value })} /></div>
            <div><Label>Receipt Prefix</Label><Input value={settings.receiptPrefix || config.prefixes.receipt} onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })} /></div>
            <div><Label>Currency</Label><Input value={settings.currency || config.currency.code} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} /></div>
            <div><Label>Timezone</Label><Input value={settings.timezone || config.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
