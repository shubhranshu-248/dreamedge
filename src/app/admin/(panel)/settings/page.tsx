import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import { SettingsPageClient } from "./client";
import {
  getAdminTeam,
  getRoles,
  getAuditLog,
  getSettings,
  getAdminUsers,
} from "./actions";
import type { UserRole } from "@/types/database";

export const metadata = {
  title: "Settings | Dream Edge Admin",
};

const SETTINGS_ROLES: UserRole[] = ["super_admin", "technical"];

function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

async function SettingsContent() {
  await connection();

  const admin = await getAdminSession();

  if (!admin || !hasPermission(admin, SETTINGS_ROLES)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don&apos;t have permission to access the settings section. Contact
          a super admin or technical administrator for access.
        </p>
      </div>
    );
  }

  const [teamResult, rolesResult, auditResult, settingsResult, adminUsersResult] =
    await Promise.all([
      getAdminTeam(1, ""),
      getRoles(),
      getAuditLog(1, "", "all", "", "", "all"),
      getSettings(),
      getAdminUsers(),
    ]);

  return (
    <SettingsPageClient
      initialTeam={teamResult.data ?? []}
      initialTeamCount={teamResult.count}
      initialRoles={rolesResult.data ?? []}
      initialAuditLog={auditResult.data ?? []}
      initialAuditLogCount={auditResult.count}
      initialSettings={settingsResult.data ?? []}
      adminUsers={adminUsersResult.data ?? []}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
