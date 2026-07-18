import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";
import { config } from "@/lib/config";
import PublicNavbar from "@/components/PublicNavbar";

async function getPlans() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/content`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.settings || null;
  } catch { return null; }
}

export default async function PlansPage() {
  const [plans, settings] = await Promise.all([getPlans(), getSettings()]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNavbar />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Study Plans</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the plan that suits your study schedule. All plans include WiFi, AC, and power backup.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">No plans available yet.</p>
                <p className="text-gray-600 text-sm mt-2">Please check back later or contact the library for more information.</p>
              </div>
            )}
            {plans.map((plan: any) => (
              <div key={plan._id} className={`bg-gray-900/80 backdrop-blur-xl rounded-2xl border p-8 text-center transition-all duration-300 hover:shadow-lg ${plan.shiftType === "full_day" ? "border-blue-500/50 shadow-blue-500/10 scale-105" : "border-gray-800 hover:border-gray-700"}`}>
                {plan.shiftType === "full_day" && (
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="text-2xl font-bold mt-4 mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">
                  {plan.shiftType === "full_day" ? "6:00 AM - 10:00 PM" : `${plan.startTime} - ${plan.endTime}`}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹{plan.monthlyFee}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                {plan.admissionFee > 0 && (
                  <p className="text-sm text-gray-400 mb-1">Admission Fee: ₹{plan.admissionFee}</p>
                )}
                {plan.securityDeposit > 0 && (
                  <p className="text-sm text-gray-400 mb-4">Security Deposit: ₹{plan.securityDeposit} (refundable)</p>
                )}
                <ul className="space-y-3 mb-8 text-left">
                  {plan.facilities?.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-emerald-400 mb-4">{plan.availableSeats || 10} seats available</p>
                <Link href="/auth/login" className={`block w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.shiftType === "full_day" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                  Login to Join
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
