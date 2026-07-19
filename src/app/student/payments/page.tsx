"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentPaymentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load</p>;

  const { recentPayments } = profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment History</h1>

      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Receipt</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments?.length > 0 ? recentPayments.map((p: any) => (
                  <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">{p.receiptNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(p.paymentDate)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">{formatCurrency(p.finalAmount)}</td>
                    <td className="px-6 py-4 capitalize text-sm text-gray-300">{p.method.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === "completed" ? "success" : "secondary"}>{p.status}</Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No payment history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
