import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/admin/content/course-form";

async function getCourse(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("id, name, thumbnail_url, weight, created_at")
    .order("weight");
  return data || [];
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, categories] = await Promise.all([
    getCourse(id),
    getCategories(),
  ]);

  if (!course) {
    notFound();
  }

  return <CourseForm course={course} categories={categories} />;
}
