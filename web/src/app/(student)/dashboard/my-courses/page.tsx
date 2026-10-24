import type { Metadata } from "next";
import { requireStudent } from "@/lib/auth-student";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentWithCourse } from "@/types/enrollment";
import { MyCoursesContent } from "@/components/student/dashboard/my-courses-content";


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

async function fetchCourseProgress(
  studentId: string,
  courseIds: string[]
): Promise<Map<string, { total: number; completed: number; pct: number }>> {
  const progressMap = new Map<
    string,
    { total: number; completed: number; pct: number }
  >();

  if (courseIds.length === 0) return progressMap;

  try {
    const supabase = await createClient();

    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, course_id")
      .in("course_id", courseIds)
      .eq("is_published", true);

    const { data: progress } = await supabase
      .from("student_progress")
      .select("lesson_id, course_id, status")
      .eq("student_id", studentId)
      .in("course_id", courseIds);

    const lessonsByCourse = new Map<string, number>();
    for (const l of lessons ?? []) {
      lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);
    }

    const completedByCourse = new Map<string, number>();
    for (const p of progress ?? []) {
      if (p.status === "completed") {
        completedByCourse.set(
          p.course_id,
          (completedByCourse.get(p.course_id) ?? 0) + 1
        );
      }
    }

    for (const cid of courseIds) {
      const total = lessonsByCourse.get(cid) ?? 0;
      const completed = completedByCourse.get(cid) ?? 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      progressMap.set(cid, { total, completed, pct });
    }
  } catch {
    // Tables may not exist yet
  }

  return progressMap;
}

export default async function MyCoursesPage() {
  const student = await requireStudent();
  const enrollments = await fetchEnrollments(student.id);

  const courseIds = enrollments
    .filter((e) => e.course != null)
    .map((e) => e.course_id);

  const progressMap = await fetchCourseProgress(student.id, courseIds);

  const progressData: Record<
    string,
    { total: number; completed: number; pct: number }
  > = {};
  for (const [cid, val] of progressMap) {
    progressData[cid] = val;
  }

  return (
    <MyCoursesContent enrollments={enrollments} progress={progressData} />
  );
}
