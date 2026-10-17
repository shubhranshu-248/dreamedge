import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseDetailContent } from "@/components/student/courses/course-detail-content";
import type { Course } from "@/types/course";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("title, description, meta_title, meta_description")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (!data) return { title: "Course Not Found" };

    return {
      title: data.meta_title || data.title,
      description: data.meta_description || data.description || `Learn with Dream Edge Online`,
    };
  } catch {
    return { title: "Course Not Found" };
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let course: Course | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (data) {
      course = data as unknown as Course;
    }
  } catch {
    // Table may not exist
  }

  if (!course) {
    notFound();
  }

  return <CourseDetailContent course={course} />;
}
