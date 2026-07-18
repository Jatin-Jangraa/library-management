"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { config } from "@/lib/config";

export default function PublicNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardHref = role === "owner" || role === "staff" ? "/admin" : "/student";

  return (
    <nav className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{config.library.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link href="/plans" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Plans</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</Link>
            <Link href="/events" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Events</Link>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
