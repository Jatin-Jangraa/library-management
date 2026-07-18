"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { config } from "@/lib/config";

export default function StudentPaymentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d.data); setLoading(false); });
  }, []);

  const handlePay = async () => {
    if (!profile?.membership?.planId?._id) return;
    setPaying(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: profile.membership.planId._id }),
      });
      const data = await res.json();
      if (!data.success) { alert(data.error); setPaying(false); return; }

      const order = data.data;
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: config.currency.code,
        name: `${config.library.name} Payment`,
        description: `Payment for ${order.planName}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: profile.membership.planId._id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful!");
            window.location.reload();
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: profile.user?.name,
          email: profile.user?.email,
          contact: profile.user?.phone,
        },
        theme: { color: "#3b82f6" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initiation failed");
    }
    setPaying(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!profile) return <p className="text-center py-20 text-gray-500">Failed to load</p>;

  const { membership, recentPayments } = profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      {membership && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Payment Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold">{formatCurrency(membership.totalAmount)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(membership.amountPaid)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(membership.pendingAmount)}</p>
              </div>
              <div className="flex items-center justify-center">
                {membership.pendingAmount > 0 && (
                  <Button onClick={handlePay} disabled={paying}>
                    {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments?.length > 0 ? recentPayments.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                  <TableCell className="text-sm">{formatDate(p.paymentDate)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(p.finalAmount)}</TableCell>
                  <TableCell className="capitalize text-sm">{p.method.replace("_", " ")}</TableCell>
                  <TableCell><Badge variant={p.status === "completed" ? "success" : "secondary"}>{p.status}</Badge></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No payment history</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
