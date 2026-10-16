"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { inviteAdmin } from "@/app/admin/(panel)/settings/actions";
import type { RoleRow } from "@/app/admin/(panel)/settings/actions";

interface InviteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleRow[];
  onSuccess: () => void;
}

export function InviteAdminDialog({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: InviteAdminDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setRoleId("");
    setTempPassword(null);
    setCopied(false);
  }

  function handleClose(val: boolean) {
    if (!val) resetForm();
    onOpenChange(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !roleId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const result = await inviteAdmin({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        roleId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data?.tempPassword) {
        setTempPassword(result.data.tempPassword);
        toast.success("Admin invited successfully.");
        onSuccess();
      }
    });
  }

  async function handleCopy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (tempPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Invited</DialogTitle>
            <DialogDescription>
              Share this temporary password with the new admin. They will need
              to reset it on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Temporary Password</Label>
            <div className="flex items-center gap-2">
              <Input value={tempPassword} readOnly className="font-mono" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Create a new admin user account with a temporary password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name *</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email *</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dreamedge.online"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-phone">Phone</Label>
            <Input
              id="invite-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
