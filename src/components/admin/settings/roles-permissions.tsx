"use client";

import { useState, useTransition } from "react";
import { Shield, Users, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoles } from "@/app/admin/(panel)/settings/actions";
import type { RoleRow } from "@/app/admin/(panel)/settings/actions";
import { EditRoleDialog } from "./edit-role-dialog";

interface RolesPermissionsProps {
  initialData: RoleRow[];
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  content_creator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  teacher: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  accountant: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  support_staff: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  technical: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
};

function formatRoleName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPermissionName(perm: string) {
  return perm.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RolesPermissions({ initialData }: RolesPermissionsProps) {
  const [roles, setRoles] = useState(initialData);
  const [editTarget, setEditTarget] = useState<RoleRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function reload() {
    startTransition(async () => {
      const result = await getRoles();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRoles(result.data ?? []);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending && roles.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))
          : roles.map((role) => {
              const isSuperAdmin = role.name === "super_admin";
              const enabledPermissions = Object.entries(role.permissions)
                .filter(([, v]) => v)
                .map(([k]) => k);

              return (
                <Card
                  key={role.id}
                  className={`p-4 flex flex-col gap-3 ${isPending ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <Badge
                        variant="secondary"
                        className={`text-xs ${ROLE_COLORS[role.name] ?? ""}`}
                      >
                        {formatRoleName(role.name)}
                      </Badge>
                    </div>
                    {!isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditTarget(role)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description || "No description"}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {role.admin_count} active {role.admin_count === 1 ? "member" : "members"}
                  </div>

                  <div className="mt-auto pt-2 border-t">
                    {isSuperAdmin ? (
                      <span className="text-xs font-medium text-muted-foreground">
                        All Permissions (not editable)
                      </span>
                    ) : enabledPermissions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        No permissions assigned
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {enabledPermissions.slice(0, 5).map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                            {formatPermissionName(p)}
                          </Badge>
                        ))}
                        {enabledPermissions.length > 5 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{enabledPermissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
      </div>

      {editTarget && (
        <EditRoleDialog
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          role={editTarget}
          onSuccess={reload}
        />
      )}
    </div>
  );
}
