import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { StudentShell } from "@/components/student/student-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Dream Edge Online — Premium Coaching for Classes 6-10",
    template: "%s | Dream Edge Online",
  },
};

async function getSocialLinks() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_youtube", "social_instagram", "social_telegram"]);

    if (!data) return undefined;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return {
      youtube: (map.social_youtube as string) ?? undefined,
      instagram: (map.social_instagram as string) ?? undefined,
      telegram: (map.social_telegram as string) ?? undefined,
    };
  } catch {
    return undefined;
  }
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialLinks = await getSocialLinks();

  return <StudentShell socialLinks={socialLinks}>{children}</StudentShell>;
}
