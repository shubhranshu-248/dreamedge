import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminSession, hasPermission } from "@/lib/admin";
import { SettingsPageClient } from "./client";
import {
  getAdminTeam,
  getRoles,
  getAuditLog,
  getSettings,
  getAdminUsersLite,
} from "./actions";

const SETTINGS_ROLES = ["super_admin", "technical"] as const;

export const metadata: Metadata = {
  title: "Settings | Dream Edge Admin",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  await connection();
  const admin = await getAdminSession();

  if (!admin || !hasPermission(admin, [...SETTINGS_ROLES])) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don&apos;t have permission to view settings.
          Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  const [teamResult, rolesResult, auditResult, settingsResult, adminUsersResult] =
    await Promise.all([
      getAdminTeam({ page: 1, pageSize: 10 }),
      getRoles(),
      getAuditLog({ page: 1, pageSize: 20 }),
      getSettings(),
      getAdminUsersLite(),
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

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-[480px]" />
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
