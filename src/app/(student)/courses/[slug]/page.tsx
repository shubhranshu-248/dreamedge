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
  let isEnrolled = false;

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

    if (course) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (student) {
            const { data: enrollment } = await supabase
              .from("enrollments")
              .select("id")
              .eq("student_id", student.id)
              .eq("course_id", course.id)
              .eq("status", "active")
              .maybeSingle();

            isEnrolled = !!enrollment;
          }
        }
      } catch {
        // Enrollments table may not exist yet
      }
    }
  } catch {
    // Table may not exist
  }

  if (!course) {
    notFound();
  }

  return <CourseDetailContent course={course} isEnrolled={isEnrolled} />;
}
