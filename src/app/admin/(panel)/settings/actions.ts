"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_ROLES = ["super_admin", "technical"] as const;

function sanitizeSearch(input: string): string {
  return input.replace(/[,().%_*]/g, "");
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pass = "";
  for (let i = 0; i < 14; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role_id: string;
  roles: { id: string; name: string; description: string | null } | null;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, boolean> | null;
  created_at: string;
  admin_count: number;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

export interface AdminUserOption {
  id: string;
  user_id: string;
  full_name: string;
}

// ─── 1. Admin Team ───────────────────────────────────────────────────────────

export async function getAdminTeam(
  page: number,
  search: string
): Promise<{ data: AdminUserRow[] | null; count: number; error: string | null }> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("admin_users")
      .select(
        "id, user_id, full_name, email, phone, is_active, last_login_at, created_at, role_id, roles(id, name, description)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const safe = sanitizeSearch(search);
      query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return { data: null, count: 0, error: error.message };
    }

    return {
      data: (data as unknown as AdminUserRow[]) ?? [],
      count: count ?? 0,
      error: null,
    };
  } catch {
    return { data: null, count: 0, error: "You don't have permission to view admin team." };
  }
}

export async function getAdminDetail(
  id: string
): Promise<{ data: AdminUserRow | null; error: string | null }> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select(
        "id, user_id, full_name, email, phone, is_active, last_login_at, created_at, role_id, roles(id, name, description)"
      )
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as AdminUserRow, error: null };
  } catch {
    return { data: null, error: "You don't have permission to view admin details." };
  }
}

export async function inviteAdmin(formData: {
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
}): Promise<{ data: { tempPassword: string } | null; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    const tempPassword = generateTempPassword();

    const { data: authUser, error: authError } =
      await serviceClient.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      return { data: null, error: authError.message };
    }

    const { error: insertError } = await supabase.from("admin_users").insert({
      user_id: authUser.user.id,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone || null,
      role_id: formData.roleId,
      is_active: true,
    });

    if (insertError) {
      await serviceClient.auth.admin.deleteUser(authUser.user.id);
      return { data: null, error: insertError.message };
    }

    await supabase.from("audit_log").insert({
      user_id: adminUser.user_id,
      action: "invite",
      entity_type: "admin_user",
      entity_id: authUser.user.id,
      new_data: {
        full_name: formData.fullName,
        email: formData.email,
        role_id: formData.roleId,
      },
    });

    revalidatePath("/admin/settings");
    return { data: { tempPassword }, error: null };
  } catch {
    return { data: null, error: "You don't have permission to invite admins." };
  }
}

export async function updateAdmin(
  id: string,
  formData: { fullName: string; phone?: string; roleId: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data: target } = await supabase
      .from("admin_users")
      .select("id, user_id, full_name, role_id, roles(name)")
      .eq("id", id)
      .single();

    if (!target) {
      return { success: false, error: "Admin user not found." };
    }

    const targetRoleName = (target.roles as unknown as { name: string })?.name;

    if (
      adminUser.id === id &&
      targetRoleName === "super_admin" &&
      formData.roleId !== target.role_id
    ) {
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("role_id", target.role_id);

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          error: "Cannot change role: you are the last active super admin.",
        };
      }
    }

    const { error } = await supabase
      .from("admin_users")
      .update({
        full_name: formData.fullName,
        phone: formData.phone || null,
        role_id: formData.roleId,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_log").insert({
      user_id: adminUser.user_id,
      action: "update",
      entity_type: "admin_user",
      entity_id: target.user_id,
      old_data: {
        full_name: target.full_name,
        role_id: target.role_id,
      },
      new_data: {
        full_name: formData.fullName,
        role_id: formData.roleId,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "You don't have permission to update admins." };
  }
}

export async function toggleAdminActive(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    if (adminUser.id === id) {
      return { success: false, error: "You cannot deactivate yourself." };
    }

    const { data: target } = await supabase
      .from("admin_users")
      .select("id, user_id, is_active, role_id, roles(name)")
      .eq("id", id)
      .single();

    if (!target) {
      return { success: false, error: "Admin user not found." };
    }

    const targetRoleName = (target.roles as unknown as { name: string })?.name;

    if (target.is_active && targetRoleName === "super_admin") {
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("role_id", target.role_id);

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          error: "Cannot deactivate the last active super admin.",
        };
      }
    }

    const newActive = !target.is_active;

    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_log").insert({
      user_id: adminUser.user_id,
      action: "toggle_active",
      entity_type: "admin_user",
      entity_id: target.user_id,
      new_data: { is_active: newActive },
    });

    revalidatePath("/admin/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "You don't have permission to modify admin status." };
  }
}

export async function deleteAdmin(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    if (adminUser.id === id) {
      return { success: false, error: "You cannot delete yourself." };
    }

    const { data: target } = await supabase
      .from("admin_users")
      .select("id, user_id, role_id, roles(name)")
      .eq("id", id)
      .single();

    if (!target) {
      return { success: false, error: "Admin user not found." };
    }

    const targetRoleName = (target.roles as unknown as { name: string })?.name;

    if (targetRoleName === "super_admin") {
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("role_id", target.role_id);

      if ((count ?? 0) <= 1) {
        return {
          success: false,
          error: "Cannot delete the last super admin.",
        };
      }
    }

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    const serviceClient = createServiceClient();
    await serviceClient.auth.admin.updateUserById(target.user_id, {
      ban_duration: "876000h",
    });

    await supabase.from("audit_log").insert({
      user_id: adminUser.user_id,
      action: "delete",
      entity_type: "admin_user",
      entity_id: target.user_id,
    });

    revalidatePath("/admin/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "You don't have permission to delete admins." };
  }
}

// ─── 2. Roles & Permissions ──────────────────────────────────────────────────

export async function getRoles(): Promise<{
  data: RoleRow[] | null;
  error: string | null;
}> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, name, description, permissions, created_at")
      .order("created_at", { ascending: true });

    if (rolesError) {
      return { data: null, error: rolesError.message };
    }

    const { data: admins } = await supabase
      .from("admin_users")
      .select("role_id")
      .eq("is_active", true);

    const countMap: Record<string, number> = {};
    (admins ?? []).forEach((a) => {
      countMap[a.role_id] = (countMap[a.role_id] || 0) + 1;
    });

    const rolesWithCounts: RoleRow[] = (roles ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions as Record<string, boolean> | null,
      created_at: r.created_at,
      admin_count: countMap[r.id] || 0,
    }));

    return { data: rolesWithCounts, error: null };
  } catch {
    return { data: null, error: "You don't have permission to view roles." };
  }
}

export async function updateRolePermissions(
  roleId: string,
  formData: { description: string; permissions: Record<string, boolean> }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data: role } = await supabase
      .from("roles")
      .select("id, name, permissions")
      .eq("id", roleId)
      .single();

    if (!role) {
      return { success: false, error: "Role not found." };
    }

    if (role.name === "super_admin") {
      return { success: false, error: "Cannot modify super admin permissions." };
    }

    const { error } = await supabase
      .from("roles")
      .update({
        description: formData.description,
        permissions: formData.permissions,
      })
      .eq("id", roleId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_log").insert({
      user_id: adminUser.user_id,
      action: "update_permissions",
      entity_type: "role",
      entity_id: roleId,
      old_data: { permissions: role.permissions },
      new_data: { permissions: formData.permissions },
    });

    revalidatePath("/admin/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "You don't have permission to update role permissions." };
  }
}

// ─── 3. Audit Log ────────────────────────────────────────────────────────────

export async function getAuditLog(
  page: number,
  search: string,
  entityType: string,
  dateFrom: string,
  dateTo: string,
  userId: string
): Promise<{ data: AuditLogRow[] | null; count: number; error: string | null }> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("audit_log")
      .select(
        "id, user_id, action, entity_type, entity_id, old_data, new_data, metadata, ip_address, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const safe = sanitizeSearch(search);
      query = query.or(
        `action.ilike.%${safe}%,entity_type.ilike.%${safe}%`
      );
    }

    if (entityType && entityType !== "all") {
      query = query.eq("entity_type", entityType);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
    }

    if (userId && userId !== "all") {
      query = query.eq("user_id", userId);
    }

    const { data, count, error } = await query;

    if (error) {
      return { data: null, count: 0, error: error.message };
    }

    return {
      data: (data as unknown as AuditLogRow[]) ?? [],
      count: count ?? 0,
      error: null,
    };
  } catch {
    return { data: null, count: 0, error: "You don't have permission to view audit logs." };
  }
}

export async function exportAuditLog(
  search: string,
  entityType: string,
  dateFrom: string,
  dateTo: string,
  userId: string
): Promise<{ data: AuditLogRow[] | null; error: string | null }> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    let query = supabase
      .from("audit_log")
      .select(
        "id, user_id, action, entity_type, entity_id, old_data, new_data, metadata, ip_address, created_at"
      )
      .order("created_at", { ascending: false });

    if (search) {
      const safe = sanitizeSearch(search);
      query = query.or(
        `action.ilike.%${safe}%,entity_type.ilike.%${safe}%`
      );
    }

    if (entityType && entityType !== "all") {
      query = query.eq("entity_type", entityType);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
    }

    if (userId && userId !== "all") {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as AuditLogRow[]) ?? [], error: null };
  } catch {
    return { data: null, error: "You don't have permission to export audit logs." };
  }
}

// ─── 4. Platform Settings ────────────────────────────────────────────────────

export async function getSettings(): Promise<{
  data: SiteSettingRow[] | null;
  error: string | null;
}> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value, updated_at, updated_by")
      .order("key", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as SiteSettingRow[]) ?? [], error: null };
  } catch {
    return { data: null, error: "You don't have permission to view settings." };
  }
}

export async function updateSettings(
  entries: { key: string; value: unknown }[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { adminUser } = await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    for (const entry of entries) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: entry.key,
            value: entry.value as Record<string, unknown>,
            updated_at: new Date().toISOString(),
            updated_by: adminUser.id,
          },
          { onConflict: "key" }
        );

      if (error) {
        return { success: false, error: `Failed to update "${entry.key}": ${error.message}` };
      }
    }

    revalidatePath("/admin/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "You don't have permission to update settings." };
  }
}

// ─── 5. Helpers ──────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<{
  data: AdminUserOption[] | null;
  error: string | null;
}> {
  try {
    await assertAdmin([...ALLOWED_ROLES]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, user_id, full_name")
      .order("full_name", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as AdminUserOption[]) ?? [], error: null };
  } catch {
    return { data: null, error: "You don't have permission to view admin users." };
  }
}
