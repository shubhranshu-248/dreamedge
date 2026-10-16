"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { updateRolePermissions } from "@/app/admin/(panel)/settings/actions";
import type { RoleRow } from "@/app/admin/(panel)/settings/actions";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow;
  onSuccess: () => void;
}

const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
  {
    label: "Content",
    permissions: [
      "view_courses", "edit_courses", "delete_courses",
      "manage_content", "manage_tests", "manage_question_bank",
    ],
  },
  {
    label: "Students",
    permissions: [
      "view_students", "edit_students", "manage_leads", "manage_testimonials",
    ],
  },
  {
    label: "Revenue",
    permissions: [
      "view_revenue", "manage_orders", "manage_refunds", "manage_referrals",
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
      "manage_admins", "manage_roles", "view_audit_log", "manage_platform",
    ],
  },
];

function formatPermissionName(perm: string) {
  return perm.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EditRoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: EditRoleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState(role.description ?? "");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    () => ({ ...role.permissions })
  );

  function handleToggle(perm: string) {
    setPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  }

  function handleSubmit() {
    const formData = new FormData();
    formData.set("description", description);
    formData.set("permissions", JSON.stringify(permissions));

    startTransition(async () => {
      const result = await updateRolePermissions(role.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Permissions updated");
      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {formatPermissionName(role.name)}</DialogTitle>
          <DialogDescription>
            Configure the permissions for this role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe what this role can do..."
            />
          </div>

          <Separator />

          <div className="space-y-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <h4 className="text-sm font-medium mb-2">{group.label}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!permissions[perm]}
                        onChange={() => handleToggle(perm)}
                        className="rounded border-muted-foreground/30"
                      />
                      {formatPermissionName(perm)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
