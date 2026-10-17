import type { Metadata } from "next";
import { requireStudent } from "@/lib/auth-student";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentWithCourse } from "@/types/enrollment";
import { MyCoursesContent } from "@/components/student/dashboard/my-courses-content";

export const instant = false;

export const metadata: Metadata = {
  title: "My Courses",
};

async function fetchEnrollments(
  studentId: string
): Promise<EnrollmentWithCourse[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        id, student_id, course_id, status, payment_id, payment_order_id,
        payment_amount, payment_method, payment_status, purchased_at,
        valid_until, created_at, updated_at,
        course:courses(
          id, title, slug, thumbnail_url, class, subject,
          teacher_name, total_lessons, duration_hours
        )
      `
      )
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("purchased_at", { ascending: false });

    if (error) return [];
    return (data as unknown as EnrollmentWithCourse[]) ?? [];
  } catch {
    return [];
  }
}

export default async function MyCoursesPage() {
  const student = await requireStudent();
  const enrollments = await fetchEnrollments(student.id);

  return <MyCoursesContent enrollments={enrollments} />;
}
