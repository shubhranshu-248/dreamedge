"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Shield, ScrollText, Wrench } from "lucide-react";
import { AdminTeamTable } from "@/components/admin/settings/admin-team-table";
import { RolesPermissions } from "@/components/admin/settings/roles-permissions";
import { AuditLogTable } from "@/components/admin/settings/audit-log-table";
import { PlatformSettings } from "@/components/admin/settings/platform-settings";
import type {
  AdminUserRow,
  RoleRow,
  AuditLogRow,
  SiteSettingRow,
  AdminUserOption,
} from "./actions";

interface SettingsPageClientProps {
  initialTeam: AdminUserRow[];
  initialTeamCount: number;
  initialRoles: RoleRow[];
  initialAuditLog: AuditLogRow[];
  initialAuditLogCount: number;
  initialSettings: SiteSettingRow[];
  adminUsers: AdminUserOption[];
}

export function SettingsPageClient({
  initialTeam,
  initialTeamCount,
  initialRoles,
  initialAuditLog,
  initialAuditLogCount,
  initialSettings,
  adminUsers,
}: SettingsPageClientProps) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage admin team, roles, audit logs, and platform configuration.
        </p>
      </div>

      <Tabs defaultValue="team">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="team">
            <Users className="mr-1.5 h-4 w-4" />
            Admin Team
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="mr-1.5 h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ScrollText className="mr-1.5 h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Wrench className="mr-1.5 h-4 w-4" />
            Platform
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
          <AdminTeamTable
            initialData={initialTeam}
            initialCount={initialTeamCount}
            roles={initialRoles}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPermissions initialData={initialRoles} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogTable
            initialData={initialAuditLog}
            initialCount={initialAuditLogCount}
            adminUsers={adminUsers}
          />
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <PlatformSettings initialData={initialSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
