// OAuth / email-link callback. Exchanges the auth code for a session cookie
// and ensures the authenticated user has a matching `students` row.
//
// Supabase dashboard requirements:
//   Auth -> URL Configuration -> Site URL = your production URL
//   Auth -> URL Configuration -> Redirect URLs must include
//     http://localhost:3000/auth/callback and your production /auth/callback
//   Auth -> Providers -> Google must be enabled with a GCP OAuth client
//     (Client ID + Secret pasted into Supabase; the Supabase-provided
//     redirect URL added to the GCP OAuth client's authorized redirect URIs).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function randomReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DE";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function ensureStudentRow(userId: string, user: {
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): Promise<void> {
  const service = createServiceClient();

  const { data: existing } = await service
    .from("students")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "Student";

  const email =
    (user.email && user.email.toLowerCase().trim()) ||
    (user.phone
      ? `${user.phone.replace(/[^0-9]/g, "")}@phone.dreamedge.local`
      : `${userId}@user.dreamedge.local`);

  // NOTE: `free_trial_expires_at` isn't in the live `students` schema yet.
  // When we add it in a future migration, re-introduce the trial-days lookup
  // from site_settings and populate the column here.
  await service.from("students").insert({
    user_id: userId,
    full_name: fullName,
    email,
    phone: user.phone || null,
    referral_code: randomReferralCode(),
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`
    );
  }

  try {
    await ensureStudentRow(data.user.id, {
      email: data.user.email,
      phone: data.user.phone,
      user_metadata: data.user.user_metadata,
    });
  } catch (err) {
    console.error("[auth/callback] failed to upsert student row", err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
