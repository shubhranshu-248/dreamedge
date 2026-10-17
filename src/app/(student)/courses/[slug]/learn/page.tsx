import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth-student";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import { LearnContent } from "@/components/student/courses/learn-content";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return {
    title: course ? `${course.title} — Learn` : "Course Not Found",
  };
}

export default async function LearnPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const student = await requireStudent();

  let isEnrolled = false;
  try {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", course.id)
      .eq("status", "active")
      .single();

    isEnrolled = !!enrollment;
  } catch {
    isEnrolled = false;
  }

  if (!isEnrolled) {
    redirect(`/courses/${slug}`);
  }

  return <LearnContent course={course as Course} />;
}
