import Link from "next/link";
import { BookOpen, Shield, Clock, Users, Star, CheckCircle } from "lucide-react";
import { config } from "@/lib/config";

export default function AboutPage() {
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
              <Link href="/about" className="text-sm text-white font-medium">About</Link>
              <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</Link>
              <Link href="/auth/login" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">About Our Library</h1>

          <p className="text-xl text-center text-gray-400 mb-12">
            Prestige Study Library is the premier destination for students seeking a focused, comfortable, and well-equipped study environment in the city.
          </p>

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

          <h2 className="text-2xl font-bold mt-12 mb-4">Library Rules</h2>
          <ul className="space-y-2">
            {[
              "Maintain complete silence in study areas",
              "Carry your library ID card at all times",
              "No food allowed in the study halls",
              "Mobile phones must be on silent mode",
              "Report any issues to staff immediately",
              "Return library resources on time",
              "Keep your area clean and tidy",
              "No smoking or alcohol on premises",
            ].map((rule, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> {rule}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Opening Hours</h2>
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="font-medium">Monday - Sunday</p><p className="text-gray-400">6:00 AM - 10:00 PM</p></div>
              <div><p className="font-medium">Holidays</p><p className="text-gray-400">Check events for holiday schedule</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
