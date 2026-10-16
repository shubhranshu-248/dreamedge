"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search, UserPlus, ChevronLeft, ChevronRight,
  Loader2, MoreHorizontal, Pencil, Power, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminTeam,
  toggleAdminActive,
  deleteAdmin,
} from "@/app/admin/(panel)/settings/actions";
import type { AdminUserRow, RoleRow } from "@/app/admin/(panel)/settings/actions";
import { formatRelativeTime } from "@/lib/format";
import { InviteAdminDialog } from "./invite-admin-dialog";
import { EditAdminDialog } from "./edit-admin-dialog";

interface AdminTeamTableProps {
  initialData: AdminUserRow[];
  initialCount: number;
  roles: RoleRow[];
}

const ROLE_STYLES: Record<string, string> = {
  super_admin: "bg-red-500/10 text-red-600 dark:text-red-400",
  content_creator: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  teacher: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  accountant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  support_staff: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  technical: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function AdminTeamTable({
  initialData,
  initialCount,
  roles,
}: AdminTeamTableProps) {
  const [data, setData] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | "delete";
    admin: AdminUserRow;
  } | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);

  const loadData = useCallback((p: number, s: string) => {
    const requestId = ++requestIdRef.current;
    startTransition(async () => {
      const result = await getAdminTeam(p, s);
      if (requestIdRef.current !== requestId) return;
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData(result.data ?? []);
      setCount(result.count);
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadData(1, search);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, loadData]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    loadData(newPage, search);
  }

  function handleEdit(admin: AdminUserRow) {
    setEditTarget(admin);
    setEditOpen(true);
  }

  function handleToggle(admin: AdminUserRow) {
    setConfirmAction({ type: "toggle", admin });
    setConfirmOpen(true);
  }

  function handleDelete(admin: AdminUserRow) {
    setConfirmAction({ type: "delete", admin });
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    setConfirmPending(true);

    const result =
      confirmAction.type === "toggle"
        ? await toggleAdminActive(confirmAction.admin.id)
        : await deleteAdmin(confirmAction.admin.id);

    setConfirmPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      confirmAction.type === "toggle"
        ? `Admin ${confirmAction.admin.is_active ? "deactivated" : "activated"} successfully.`
        : "Admin deleted successfully."
    );
    setConfirmOpen(false);
    setConfirmAction(null);
    loadData(page, search);
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const showFrom = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(page * PAGE_SIZE, count);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Last Login</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-muted-foreground">No admin users found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setInviteOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite your first admin
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data.map((admin) => {
                const roleName = admin.roles?.name ?? "unknown";
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {admin.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={ROLE_STYLES[roleName] ?? ""}
                      >
                        {roleName.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          admin.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                        }
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {admin.last_login_at
                        ? formatRelativeTime(admin.last_login_at)
                        : "Never"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {dateFormatter.format(new Date(admin.created_at))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(admin)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(admin)}>
                            <Power className="mr-2 h-4 w-4" />
                            {admin.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(admin)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {showFrom}–{showTo} of {count}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <InviteAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        onSuccess={() => loadData(page, search)}
      />

      <EditAdminDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        admin={editTarget}
        roles={roles}
        onSuccess={() => loadData(page, search)}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "toggle"
                ? confirmAction.admin.is_active
                  ? "Deactivate Admin"
                  : "Activate Admin"
                : "Delete Admin"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "toggle"
                ? confirmAction.admin.is_active
                  ? "Deactivating will immediately revoke this admin's access to the panel. They can be reactivated later."
                  : "This will restore the admin's access to the panel."
                : "This action cannot be undone. The admin user will be permanently removed and their auth account will be deactivated."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={confirmPending}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === "delete" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={confirmPending}
            >
              {confirmPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmAction?.type === "toggle"
                ? confirmAction.admin.is_active
                  ? "Deactivate"
                  : "Activate"
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
