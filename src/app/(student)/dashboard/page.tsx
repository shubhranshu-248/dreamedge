import type { Metadata } from "next";
import { requireStudent } from "@/lib/auth-student";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/student/dashboard/dashboard-content";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
};

async function fetchEnrolledCourses(studentId: string) {
  try {
    const supabase = await createClient();
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, purchased_at, valid_until, status, course_id")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("purchased_at", { ascending: false })
      .limit(4);

    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.course_id);
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, slug, thumbnail_url, class")
      .in("id", courseIds);

    const courseMap = new Map(
      (courses ?? []).map((c) => [c.id, c])
    );

    return enrollments.map((e) => ({
      id: e.id,
      purchased_at: e.purchased_at,
      valid_until: e.valid_until,
      status: e.status,
      course: courseMap.get(e.course_id) ?? null,
    }));
  } catch {
    return [];
  }
}

async function fetchStudentProgress(studentId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("student_progress")
      .select("id, status, progress_pct, completed_at, lesson_id")
      .eq("student_id", studentId);
    return data ?? [];
  } catch {
    return [];
  }
}

async function fetchHoursLearned(completedLessonIds: string[]) {
  if (completedLessonIds.length === 0) return 0;

  try {
    const supabase = await createClient();
    const { data: lessons } = await supabase
      .from("lessons")
      .select("duration_minutes")
      .in("id", completedLessonIds);

    if (!lessons) return 0;

    const totalMinutes = lessons.reduce(
      (sum, l) => sum + (l.duration_minutes ?? 0),
      0
    );
    return Math.round((totalMinutes / 60) * 10) / 10;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const student = await requireStudent();

  const [enrollments, progress] = await Promise.all([
    fetchEnrolledCourses(student.id),
    fetchStudentProgress(student.id),
  ]);

  const completedProgress = progress.filter(
    (p) => p.status === "completed"
  );
  const completedLessons = completedProgress.length;

  const completedLessonIds = completedProgress.map((p) => p.lesson_id);
  const hoursLearned = await fetchHoursLearned(completedLessonIds);

  const avgProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, p) => sum + (p.progress_pct ?? 0),
            0
          ) / progress.length
        )
      : 0;

  return (
    <DashboardContent
      student={student}
      enrollments={enrollments}
      stats={{
        enrolledCourses: enrollments.length,
        completedLessons,
        hoursLearned,
        avgProgress,
      }}
    />
  );
}
