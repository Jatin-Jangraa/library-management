"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export default function HeroButtons() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardHref = role === "owner" || role === "staff" ? "/admin" : "/student";

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {isLoggedIn ? (
        <Link
          href={dashboardHref}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Link>
      ) : (
        <Link
          href="/auth/login"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center gap-2"
        >
          Login to Library <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      <Link
        href="/plans"
        className="border-2 border-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
      >
        View Plans
      </Link>
    </div>
  );
}
