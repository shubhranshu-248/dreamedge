import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/admin/content/course-form";

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("id, name, thumbnail_url, weight, created_at")
    .order("weight");
  return data || [];
}

export default async function NewCoursePage() {
  const categories = await getCategories();

  return <CourseForm categories={categories} />;
}
