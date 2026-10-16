"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  createReferralCode,
  updateReferralCode,
  type ReferralCodeRow,
} from "@/app/admin/(panel)/revenue/actions";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DE";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface ReferralCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCode: ReferralCodeRow | null;
}

export function ReferralCodeForm({ open, onOpenChange, editingCode }: ReferralCodeFormProps) {
  const isEditing = !!editingCode;
  const [code, setCode] = useState(editingCode?.code ?? "");
  const [discountType, setDiscountType] = useState(editingCode?.discount_type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(String(editingCode?.discount_value ?? ""));
  const [maxUses, setMaxUses] = useState(editingCode?.max_uses ? String(editingCode.max_uses) : "");
  const [validUntil, setValidUntil] = useState(
    editingCode?.valid_until ? new Date(editingCode.valid_until).toISOString().slice(0, 10) : ""
  );
  const [isPending, startTransition] = useTransition();

  // Reset form when dialog opens/closes or editing code changes
  function resetForm() {
    setCode(editingCode?.code ?? "");
    setDiscountType(editingCode?.discount_type ?? "percentage");
    setDiscountValue(String(editingCode?.discount_value ?? ""));
    setMaxUses(editingCode?.max_uses ? String(editingCode.max_uses) : "");
    setValidUntil(
      editingCode?.valid_until ? new Date(editingCode.valid_until).toISOString().slice(0, 10) : ""
    );
  }

  function handleAutoGenerate() {
    setCode(generateReferralCode());
  }

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("code", code);
      formData.set("discount_type", discountType);
      formData.set("discount_value", discountValue);
      if (maxUses) formData.set("max_uses", maxUses);
      if (validUntil) formData.set("valid_until", new Date(validUntil).toISOString());

      const result = isEditing
        ? await updateReferralCode(editingCode.id, formData)
        : await createReferralCode(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Referral code updated." : "Referral code created.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Referral Code</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the discount settings for this code."
              : "Create a new referral code with a discount."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="rc-code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="rc-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DREAMEDGE10"
                  className="font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={handleAutoGenerate}
                  title="Auto-generate code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">3-20 uppercase alphanumeric characters</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(v) => v && setDiscountType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-value">Value</Label>
              <Input
                id="rc-value"
                type="number"
                min={1}
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? 1 : 0.01}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "10" : "100"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rc-max">Max Uses (0 = unlimited)</Label>
              <Input
                id="rc-max"
                type="number"
                min={0}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-expiry">Expiry Date (optional)</Label>
              <Input
                id="rc-expiry"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
