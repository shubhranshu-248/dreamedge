import { createClient } from "@/lib/supabase/server";
import { ContentManagerClient } from "@/components/admin/content-manager/content-manager-client";

async function getCourses() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, name, status")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function ContentManagerPage() {
  const courses = await getCourses();

  return <ContentManagerClient courses={courses} />;
}
