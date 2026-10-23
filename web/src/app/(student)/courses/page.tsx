import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CoursesListingContent } from "@/components/student/courses/courses-listing-content";
import type { Course } from "@/types/course";
import type { Database } from "@/types/supabase";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

export const instant = false;

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all courses on Dream Edge Online",
};

interface PageProps {
  searchParams: Promise<{ class?: string; subject?: string; q?: string }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let courses: Course[] = [];
  let classes: string[] = [];
  let subjects: string[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      courses = (data as CourseRow[]).map(
        (d): Course => ({
          ...d,
          currency: d.currency ?? "INR",
          total_lessons: Number(d.total_lessons ?? 0),
          difficulty: d.difficulty ?? "medium",
          is_published: d.is_published ?? true,
          is_featured: d.is_featured ?? false,
          student_count: Number(d.student_count ?? 0),
          rating_count: Number(d.rating_count ?? 0),
          created_at: d.created_at ?? new Date(0).toISOString(),
          updated_at: d.updated_at ?? new Date(0).toISOString(),
          price: Number(d.price ?? 0),
          original_price:
            d.original_price != null ? Number(d.original_price) : null,
          rating_avg: d.rating_avg != null ? Number(d.rating_avg) : null,
          duration_hours:
            d.duration_hours != null ? Number(d.duration_hours) : null,
        })
      );
      classes = Array.from(
        new Set(courses.map((c) => c.class).filter((v): v is string => Boolean(v)))
      );
      subjects = Array.from(
        new Set(courses.map((c) => c.subject).filter((v): v is string => Boolean(v)))
      );
    }
  } catch {
    // Table may not exist yet — return empty
  }

  return (
    <CoursesListingContent
      courses={courses}
      classes={classes}
      subjects={subjects}
      initialFilters={{
        class: params.class,
        subject: params.subject,
        q: params.q,
      }}
    />
  );
}
