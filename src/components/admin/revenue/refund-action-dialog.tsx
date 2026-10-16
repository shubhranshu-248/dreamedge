"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { initiateRefund, processRefund } from "@/app/admin/(panel)/revenue/actions";
import { formatINR } from "@/lib/format";

interface RefundActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderAmount: number;
  studentName: string;
}

export function RefundActionDialog({
  open,
  onOpenChange,
  orderId,
  orderAmount,
  studentName,
}: RefundActionDialogProps) {
  const [amount, setAmount] = useState(String(orderAmount));
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund.");
      return;
    }

    const refundAmount = Number(amount);
    if (!refundAmount || refundAmount <= 0 || refundAmount > orderAmount) {
      toast.error(`Refund amount must be between ₹1 and ${formatINR(orderAmount)}.`);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("order_id", orderId);
      formData.set("amount", String(refundAmount));
      formData.set("reason", reason.trim());

      const result = await initiateRefund(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Refund request initiated successfully.");
      onOpenChange(false);
      setReason("");
      setAmount(String(orderAmount));
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate Refund</DialogTitle>
          <DialogDescription>
            Refund for {studentName} — Order #{orderId.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund Amount (₹)</Label>
            <Input
              id="refund-amount"
              type="number"
              min={1}
              max={orderAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Max: {formatINR(orderAmount)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea
              id="refund-reason"
              placeholder="Why is this refund being initiated?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Submit Refund Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Separate dialog for approving/rejecting existing refund requests
interface RefundProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundId: string;
  action: "approved" | "rejected";
}

export function RefundProcessDialog({
  open,
  onOpenChange,
  refundId,
  action,
}: RefundProcessDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (action === "rejected" && !reason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    startTransition(async () => {
      const result = await processRefund(refundId, action, reason.trim() || undefined);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Refund ${action === "approved" ? "approved" : "rejected"} successfully.`);
      onOpenChange(false);
      setReason("");
    });
  }

  const isApprove = action === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve" : "Reject"} Refund</DialogTitle>
          <DialogDescription>
            {isApprove
              ? "This will mark the order as refunded and cancel the enrollment."
              : "Provide a reason for rejecting this refund request."}
          </DialogDescription>
        </DialogHeader>
        {!isApprove && (
          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Why is this refund being rejected?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isApprove ? "Approve Refund" : "Reject Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
