import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CoursesListingContent } from "@/components/student/courses/courses-listing-content";
import type { Course } from "@/types/course";

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
      courses = data as unknown as Course[];
      classes = [...new Set(courses.map((c) => c.class).filter(Boolean))] as string[];
      subjects = [...new Set(courses.map((c) => c.subject).filter(Boolean))] as string[];
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
