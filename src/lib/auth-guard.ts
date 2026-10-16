import { createClient } from "@/lib/supabase/server";

export type AdminRole =
  | "super_admin"
  | "content_creator"
  | "teacher"
  | "accountant"
  | "support_staff"
  | "technical";

interface AdminUser {
  id: string;
  user_id: string;
  role_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role_name: AdminRole;
}

export async function assertAdmin(allowedRoles?: AdminRole[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id, user_id, role_id, full_name, email, is_active, roles(name)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !adminUser) {
    throw new Error("Forbidden");
  }

  const roleName = (adminUser.roles as unknown as { name: AdminRole })?.name;

  if (!roleName) {
    throw new Error("Forbidden");
  }

  if (allowedRoles && !allowedRoles.includes(roleName)) {
    throw new Error("Forbidden");
  }

  return {
    user,
    adminUser: {
      ...adminUser,
      role_name: roleName,
    } as AdminUser,
  };
}
