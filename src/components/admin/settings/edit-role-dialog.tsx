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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateRolePermissions } from "@/app/admin/(panel)/settings/actions";
import type { RoleRow } from "@/app/admin/(panel)/settings/actions";

const PERMISSION_GROUPS = [
  {
    label: "Content",
    permissions: [
      "view_courses",
      "edit_courses",
      "delete_courses",
      "manage_content",
      "manage_tests",
      "manage_question_bank",
    ],
  },
  {
    label: "Students",
    permissions: [
      "view_students",
      "edit_students",
      "manage_leads",
      "manage_testimonials",
    ],
  },
  {
    label: "Revenue",
    permissions: [
      "view_revenue",
      "manage_orders",
      "manage_refunds",
      "manage_referrals",
    ],
  },
  {
    label: "Live Classes",
    permissions: ["view_live_classes", "manage_live_classes"],
  },
  {
    label: "Engagement",
    permissions: ["send_notifications", "manage_banners"],
  },
  {
    label: "Settings",
    permissions: [
      "manage_admins",
      "manage_roles",
      "view_audit_log",
      "manage_platform",
    ],
  },
];

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow | null;
  onSuccess: () => void;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: EditRoleDialogProps) {
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (role) {
      setDescription(role.description ?? "");
      const perms: Record<string, boolean> = {};
      PERMISSION_GROUPS.forEach((group) => {
        group.permissions.forEach((p) => {
          perms[p] = role.permissions?.[p] === true;
        });
      });
      setPermissions(perms);
    }
  }, [role]);

  function togglePermission(key: string) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    startTransition(async () => {
      const result = await updateRolePermissions(role.id, {
        description: description.trim(),
        permissions,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Role permissions updated successfully.");
      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permissions</DialogTitle>
          <DialogDescription>
            {role?.name.replace(/_/g, " ")} — configure access permissions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role description..."
              rows={2}
            />
          </div>
          <Separator />
          <div className="space-y-5">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-sm font-medium mb-2">{group.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={permissions[perm] ?? false}
                        onChange={() => togglePermission(perm)}
                        className="rounded border-input h-4 w-4 accent-[#F26A21]"
                      />
                      <span className="text-muted-foreground">
                        {perm.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
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
              Save Permissions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
