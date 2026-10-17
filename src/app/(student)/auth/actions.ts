"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface ActionResult<T = Record<string, unknown>> {
  data?: T;
  error?: string;
}

async function generateReferralCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const service = createServiceClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "DE";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const { data } = await service
      .from("students")
      .select("id")
      .eq("referral_code", code)
      .single();

    if (!data) return code;
  }

  return "DE" + Date.now().toString(36).toUpperCase().slice(-6);
}

export async function registerStudent(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string) || null;
  const studentClass = (formData.get("class") as string) || null;
  const referredBy = (formData.get("referral_code") as string) || null;

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Full name is required." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.trim() },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Registration failed. Please try again." };
  }

  const referralCode = await generateReferralCode();

  let freeTrialExpiresAt: string | null = null;
  const service = createServiceClient();

  const { data: trialSetting } = await service
    .from("site_settings")
    .select("value")
    .eq("key", "free_trial_days")
    .single();

  if (trialSetting?.value) {
    const days = parseInt(trialSetting.value, 10);
    if (days > 0) {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      freeTrialExpiresAt = expires.toISOString();
    }
  }

  const { error: insertError } = await supabase.from("students").insert({
    user_id: userId,
    full_name: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone,
    class: studentClass,
    referral_code: referralCode,
    referred_by: referredBy?.trim() || null,
    free_trial_expires_at: freeTrialExpiresAt,
  });

  if (insertError) {
    await service.auth.admin.deleteUser(userId);
    return { error: "Registration failed. Please try again." };
  }

  return { data: { userId } };
}

export async function loginStudent(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    return { error: "Invalid email or password." };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Login failed. Please try again." };
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!student) {
    await supabase.auth.signOut();
    return { error: "Student account not found. Please register first." };
  }

  return { data: { userId } };
}

export async function forgotPassword(
  formData: FormData
): Promise<ActionResult<{ sent: boolean }>> {
  const email = formData.get("email") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  return { data: { sent: true } };
}

export async function resetPassword(
  formData: FormData
): Promise<ActionResult<{ updated: boolean }>> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Failed to update password. The link may have expired." };
  }

  return { data: { updated: true } };
}
