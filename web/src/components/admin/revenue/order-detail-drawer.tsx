"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getOrderDetail, type OrderDetail } from "@/app/admin/(panel)/revenue/actions";
import { formatINR } from "@/lib/format";
import { RefundActionDialog } from "./refund-action-dialog";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  razorpay: "Online (Razorpay)",
  manual_cash: "Cash",
  manual_upi: "UPI",
  manual_bank: "Bank Transfer",
};

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  refunded: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function OrderDetailDrawer({ orderId, onClose }: OrderDetailDrawerProps) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    if (!orderId) {
      startTransition(() => setDetail(null));
      return;
    }
    startTransition(async () => {
      const result = await getOrderDetail(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDetail(result.data);
    });
  }, [orderId]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <>
      <Sheet open={!!orderId} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              {orderId ? `#${orderId.slice(0, 8)}` : ""}
            </SheetDescription>
          </SheetHeader>

          {isPending || !detail ? (
            <div className="space-y-4 mt-6 px-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-6 mt-6 px-1">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[detail.status] ?? ""}`}>
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </span>
                <span className="text-2xl font-bold">{formatINR(detail.final_amount)}</span>
              </div>

              <Separator />

              {/* Student Info */}
              <section>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Student</h4>
                <p className="font-medium">{detail.student?.full_name ?? "—"}</p>
                {detail.student?.phone && (
                  <p className="text-sm text-muted-foreground">{detail.student.phone}</p>
                )}
                {detail.student?.email && (
                  <p className="text-sm text-muted-foreground">{detail.student.email}</p>
                )}
              </section>

              <Separator />

              {/* Course Info */}
              <section>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Course</h4>
                <p className="font-medium">{detail.course?.title ?? "—"}</p>
              </section>

              <Separator />

              {/* Payment Breakdown */}
              <section>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Amount</span>
                    <span>{formatINR(detail.amount)}</span>
                  </div>
                  {detail.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        −{formatINR(detail.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Final Amount</span>
                    <span>{formatINR(detail.final_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{PAYMENT_METHOD_LABELS[detail.payment_method] ?? detail.payment_method}</span>
                  </div>
                  {detail.referral_code_used && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referral Code</span>
                      <span className="font-mono text-xs">{detail.referral_code_used}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Razorpay IDs */}
              {(detail.razorpay_payment_id || detail.razorpay_order_id) && (
                <>
                  <Separator />
                  <section>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Razorpay</h4>
                    <div className="space-y-2">
                      {detail.razorpay_payment_id && (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Payment ID</p>
                            <p className="font-mono text-xs">{detail.razorpay_payment_id}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() => copyToClipboard(detail.razorpay_payment_id!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      {detail.razorpay_order_id && (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="font-mono text-xs">{detail.razorpay_order_id}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() => copyToClipboard(detail.razorpay_order_id!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* Enrollment */}
              {detail.enrollment && (
                <>
                  <Separator />
                  <section>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Enrollment</h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enrolled On</span>
                        <span>{detail.enrollment.purchased_at ? dateFormatter.format(new Date(detail.enrollment.purchased_at)) : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until</span>
                        <span>{detail.enrollment.valid_until ? dateFormatter.format(new Date(detail.enrollment.valid_until)) : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize">{detail.enrollment.status}</span>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* Remarks */}
              {detail.remarks && (
                <>
                  <Separator />
                  <section>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Remarks</h4>
                    <p className="text-sm">{detail.remarks}</p>
                  </section>
                </>
              )}

              {/* Timeline */}
              <Separator />
              <section>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{dateFormatter.format(new Date(detail.created_at))}</span>
                  </div>
                  {detail.updated_at !== detail.created_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{dateFormatter.format(new Date(detail.updated_at))}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <Separator />
              <div className="flex gap-2">
                {detail.invoice_url && (
                  <a
                    href={detail.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-7 gap-1 rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Invoice
                  </a>
                )}
                {detail.status === "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRefund(true)}
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Initiate Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {detail && (
        <RefundActionDialog
          open={showRefund}
          onOpenChange={setShowRefund}
          orderId={detail.id}
          orderAmount={detail.final_amount}
          studentName={detail.student?.full_name ?? "Unknown"}
        />
      )}
    </>
  );
}
