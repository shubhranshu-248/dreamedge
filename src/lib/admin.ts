import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export interface AdminSession {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role_id: string;
  role_name: UserRole;
  role_permissions: Record<string, unknown>;
  is_active: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select(
      `
      id,
      user_id,
      full_name,
      email,
      role_id,
      is_active,
      roles (
        name,
        permissions
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!adminUser || !adminUser.roles) return null;

  const role = adminUser.roles as unknown as {
    name: UserRole;
    permissions: Record<string, unknown>;
  };

  return {
    id: adminUser.id,
    user_id: adminUser.user_id,
    full_name: adminUser.full_name,
    email: adminUser.email,
    role_id: adminUser.role_id,
    role_name: role.name,
    role_permissions: role.permissions,
    is_active: adminUser.is_active,
  };
}

export function hasPermission(
  admin: AdminSession,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(admin.role_name);
}
