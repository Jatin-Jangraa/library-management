"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { config } from "@/lib/config";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/public/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSettings(d.data?.settings || null))
      .catch(() => {});
  }, []);

  const contact = {
    phone: settings?.contactPhone || config.contact.phone,
    email: settings?.contactEmail || config.contact.email,
    address: settings?.address || config.contact.address,
    whatsapp: settings?.whatsappNumber || config.contact.whatsappNumber,
  };
  const libraryName = settings?.libraryName || config.library.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">{libraryName}</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/plans" className="text-sm text-gray-300 hover:text-white transition-colors">Plans</Link>
              <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-white font-medium">Contact</Link>
              <Link href="/auth/login" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Contact Us</h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"><Phone className="h-6 w-6 text-blue-400" /></div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-400">{contact.phone}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl"><Mail className="h-6 w-6 text-purple-400" /></div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-400">{contact.email}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><MapPin className="h-6 w-6 text-emerald-400" /></div>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-400">{contact.address}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="p-6">
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl"><MessageCircle className="h-6 w-6 text-green-400" /></div>
                    <div>
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="text-gray-400">Chat with us on WhatsApp</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-800 bg-gray-900/50">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-emerald-400">&#10003;</div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-gray-400">We&apos;ll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Send us a Message</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-gray-300">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-gray-800/50 border-gray-700 text-white" /></div>
                      <div><Label className="text-gray-300">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-gray-800/50 border-gray-700 text-white" /></div>
                    </div>
                    <div><Label className="text-gray-300">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-gray-800/50 border-gray-700 text-white" /></div>
                    <div><Label className="text-gray-300">Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="bg-gray-800/50 border-gray-700 text-white" /></div>
                    <div><Label className="text-gray-300">Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required className="bg-gray-800/50 border-gray-700 text-white" /></div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
