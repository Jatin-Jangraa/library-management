"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LayoutDashboard } from "lucide-react";

export default function PlanCardButton() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardHref = role === "owner" || role === "staff" ? "/admin" : "/student";

  if (isLoggedIn) {
    return (
      <Link
        href={dashboardHref}
        className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
      >
        <LayoutDashboard className="h-4 w-4" />
        Go to Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25"
    >
      Login to Join
    </Link>
  );
}
