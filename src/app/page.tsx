import Link from "next/link";
import { BookOpen, Wifi, Shield, Coffee, Zap, Clock, CheckCircle, Star, Phone, Mail, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import { config } from "@/lib/config";

async function getPublicContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/content`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

async function getPlans() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/plans`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [content, plans] = await Promise.all([getPublicContent(), getPlans()]);
  const settings = content?.settings;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{settings?.libraryName || config.library.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
              <Link href="/plans" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Plans</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</Link>
              <Link href="/events" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Events</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {settings?.heroHeading || config.hero.heading}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              {settings?.heroDescription || config.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center gap-2">
                Login to Library <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/plans" className="border-2 border-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2">
                View Plans <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Study Plans</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Choose the perfect plan that fits your study schedule</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(plans || []).map((plan: any, index: number) => (
              <div
                key={plan._id}
                className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.shiftType === "full_day" ? "Full Day" : plan.shiftType === "morning" ? "Morning Shift" : "Evening Shift"}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹{plan.monthlyFee}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.facilities?.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25">
                  Login to Join
                </Link>
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <>
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 hover:border-blue-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-2 text-white">Full Day</h3>
                  <p className="text-gray-400 text-sm mb-4">6:00 AM - 10:00 PM</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">₹1500<span className="text-sm text-gray-500">/month</span></div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />All day access</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />WiFi & AC</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />Power backup</li>
                  </ul>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 hover:border-blue-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-2 text-white">Morning Shift</h3>
                  <p className="text-gray-400 text-sm mb-4">6:00 AM - 2:00 PM</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">₹800<span className="text-sm text-gray-500">/month</span></div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />Morning access</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />WiFi & AC</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />Power backup</li>
                  </ul>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 hover:border-blue-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-2 text-white">Evening Shift</h3>
                  <p className="text-gray-400 text-sm mb-4">2:00 PM - 10:00 PM</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">₹800<span className="text-sm text-gray-500">/month</span></div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />Evening access</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />WiFi & AC</li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-4 w-4 text-emerald-400" />Power backup</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Facilities</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need for a productive study session</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {(content?.facilities || [
              { name: "Comfortable Study Seats", icon: "📚" },
              { name: "High-Speed WiFi", icon: "📶" },
              { name: "Air Conditioning", icon: "❄️" },
              { name: "Drinking Water", icon: "💧" },
              { name: "Power Backup", icon: "⚡" },
              { name: "Charging Points", icon: "🔌" },
              { name: "CCTV Security", icon: "🔒" },
              { name: "Silent Environment", icon: "🤫" },
            ]).map((facility: any, i: number) => (
              <div key={i} className="text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1">
                <div className="text-3xl mb-3">{facility.icon || "📚"}</div>
                <h3 className="font-semibold text-white">{facility.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">What Students Say</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Hear from our satisfied students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(content?.testimonials || [
              { name: "Rahul K.", content: "Best library in the area. Very peaceful and well-maintained.", rating: 5 },
              { name: "Priya M.", content: "Excellent facilities and great study environment.", rating: 5 },
              { name: "Amit S.", content: "Affordable plans with all necessary amenities.", rating: 4 },
            ]).map((t: any, i: number) => (
              <div key={i} className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">&quot;{t.content}&quot;</p>
                <p className="font-semibold text-white">- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Contact Us</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Get in touch with us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Phone className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Phone</h3>
                <p className="text-gray-400 text-sm">{settings?.contactPhone || config.contact.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Mail className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Email</h3>
                <p className="text-gray-400 text-sm">{settings?.contactEmail || config.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <MapPin className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Address</h3>
                <p className="text-gray-400 text-sm">{settings?.address || config.contact.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} {settings?.libraryName || config.library.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
