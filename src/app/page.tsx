import Link from "next/link";
import { BookOpen, CheckCircle, Star, Phone, Mail, MapPin } from "lucide-react";
import { config } from "@/lib/config";
import PublicNavbar from "@/components/PublicNavbar";
import HeroButtons from "@/components/HeroButtons";
import PlanCardButton from "@/components/PlanCardButton";

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
      <PublicNavbar />

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
            <HeroButtons />
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
                <PlanCardButton />
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No plans available yet.</p>
                <p className="text-gray-600 text-sm mt-2">Plans will appear here once added by the admin.</p>
              </div>
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
            {(content?.facilities || []).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No facilities listed yet.</p>
                <p className="text-gray-600 text-sm mt-2">Facilities will appear here once added by the admin.</p>
              </div>
            )}
            {(content?.facilities || []).map((facility: any, i: number) => (
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
            {(content?.testimonials || []).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No testimonials yet.</p>
                <p className="text-gray-600 text-sm mt-2">Student testimonials will appear here once added by the admin.</p>
              </div>
            )}
            {(content?.testimonials || []).map((t: any, i: number) => (
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
