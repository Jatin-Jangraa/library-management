import Link from "next/link";
import { CalendarDays, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";

async function getEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/public/content`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.upcomingEvents || [];
  } catch { return []; }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">{config.library.name}</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/plans" className="text-sm text-gray-300 hover:text-white transition-colors">Plans</Link>
              <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</Link>
              <Link href="/auth/login" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Events & Notices</h1>
          <p className="text-center text-gray-400 mb-12">Stay updated with the latest events, holidays, and announcements</p>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-400 text-lg">No upcoming events at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event: any) => (
                <div key={event._id} className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 text-blue-400 rounded-xl p-3 text-center min-w-[70px] border border-blue-500/20">
                      <p className="text-2xl font-bold">{new Date(event.eventDate).getDate()}</p>
                      <p className="text-xs font-medium">{new Date(event.eventDate).toLocaleString("en", { month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                      {event.startTime && (
                        <p className="text-sm text-gray-400 mb-2">{event.startTime} - {event.endTime} {event.location && `at ${event.location}`}</p>
                      )}
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
