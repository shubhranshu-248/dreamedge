"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLead } from "@/app/admin/(panel)/students/actions";

export function LeadFormDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [source, setSource] = useState("website");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("source", source);

    startTransition(async () => {
      const result = await createLead(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lead added");
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-popover rounded-lg border border-border shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Add New Lead</h2>
                <p className="text-sm text-muted-foreground">
                  Enter lead details to start tracking.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="lead-name">Name *</Label>
                  <Input id="lead-name" name="name" required placeholder="Full name" />
                </div>

                <div>
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input id="lead-phone" name="phone" placeholder="Phone number" />
                </div>

                <div>
                  <Label htmlFor="lead-email">Email</Label>
                  <Input id="lead-email" name="email" type="email" placeholder="Email address" />
                </div>

                <div>
                  <Label>Source</Label>
                  <Select value={source} onValueChange={(v) => v && setSource(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="ad">Ad Campaign</SelectItem>
                      <SelectItem value="walk_in">Walk-in</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lead-remarks">Remarks</Label>
                  <Textarea id="lead-remarks" name="remarks" rows={3} placeholder="Notes about this lead..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Add Lead
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
