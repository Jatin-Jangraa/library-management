import Link from "next/link";
import { BookOpen, Shield, Clock, Users, CheckCircle } from "lucide-react";
import { config } from "@/lib/config";
import PublicNavbar from "@/components/PublicNavbar";

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/content`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.settings || null;
  } catch { return null; }
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function AboutPage() {
  const settings = await getSettings();
  const libraryName = settings?.libraryName || config.library.name;
  const aboutContent = settings?.aboutContent || "";
  const openTime = settings?.libraryTimings?.openTime || "06:00";
  const closeTime = settings?.libraryTimings?.closeTime || "22:00";
  const openDays = settings?.libraryTimings?.openDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNavbar />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">About Our Library</h1>

          {aboutContent ? (
            <div className="text-xl text-center text-gray-400 mb-12 whitespace-pre-line">{aboutContent}</div>
          ) : (
            <p className="text-xl text-center text-gray-400 mb-12">
              {libraryName} provides a focused, comfortable, and well-equipped study environment for students.
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300">
              <Shield className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Mission</h3>
              <p className="text-gray-400 text-sm">To provide every student with access to a world-class study environment that enables them to achieve their academic and career goals.</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <Users className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Vision</h3>
              <p className="text-gray-400 text-sm">To become the most trusted and preferred study library chain, fostering academic excellence across the country.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Opening Hours</h2>
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{openDays.join(", ") || "Monday - Sunday"}</p>
                <p className="text-gray-400">{formatTime(openTime)} - {formatTime(closeTime)}</p>
              </div>
              <div>
                <p className="font-medium">Holidays</p>
                <p className="text-gray-400">Check events for holiday schedule</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
