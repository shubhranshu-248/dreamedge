"use client";

import { useState, useEffect, useTransition } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateAdmin } from "@/app/admin/(panel)/settings/actions";
import type { AdminUserRow, RoleRow } from "@/app/admin/(panel)/settings/actions";

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUserRow | null;
  roles: RoleRow[];
  onSuccess: () => void;
}

export function EditAdminDialog({
  open,
  onOpenChange,
  admin,
  roles,
  onSuccess,
}: EditAdminDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (admin) {
      setFullName(admin.full_name);
      setPhone(admin.phone ?? "");
      setRoleId(admin.role_id);
    }
  }, [admin]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!admin || !fullName.trim() || !roleId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const result = await updateAdmin(admin.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        roleId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Admin updated successfully.");
      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>
            Update admin user details and role assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              value={admin?.email ?? ""}
              readOnly
              disabled
              className="opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
