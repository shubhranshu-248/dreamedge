"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { getRoles } from "@/app/admin/(panel)/settings/actions";
import type { RoleRow } from "@/app/admin/(panel)/settings/actions";
import { EditRoleDialog } from "./edit-role-dialog";

interface RolesPermissionsProps {
  initialData: RoleRow[];
}

const ROLE_STYLES: Record<string, string> = {
  super_admin: "bg-red-500/10 text-red-600 dark:text-red-400",
  content_creator: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  teacher: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  accountant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  support_staff: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  technical: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export function RolesPermissions({ initialData }: RolesPermissionsProps) {
  const [roles, setRoles] = useState(initialData);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      const result = await getRoles();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRoles(result.data ?? []);
    });
  }

  function handleEdit(role: RoleRow) {
    setEditTarget(role);
    setEditOpen(true);
  }

  function getPermissionList(
    permissions: Record<string, boolean> | null
  ): string[] {
    if (!permissions) return [];
    return Object.entries(permissions)
      .filter(([, v]) => v === true)
      .map(([k]) => k.replace(/_/g, " "));
  }

  return (
    <div className="space-y-4">
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSuperAdmin = role.name === "super_admin";
          const permsList = isSuperAdmin
            ? ["All Permissions"]
            : getPermissionList(role.permissions);

          return (
            <Card key={role.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge
                    variant="secondary"
                    className={ROLE_STYLES[role.name] ?? ""}
                  >
                    {role.name.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {role.admin_count}
                </div>
              </div>

              <p className="text-sm text-muted-foreground min-h-[40px]">
                {role.description || "No description set."}
              </p>

              <div className="flex-1">
                {permsList.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {permsList.map((perm) => (
                      <Badge
                        key={perm}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No permissions assigned.
                  </p>
                )}
              </div>

              {!isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(role)}
                  className="mt-1 self-start"
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit Permissions
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <EditRoleDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        role={editTarget}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
