"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface ActionResult<T = unknown> {
  data?: T;
  error?: string;
}

async function getAuthenticatedStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please log in to continue" };

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) return { error: "Student profile not found" };

  return { student };
}

async function verifyEnrollment(studentId: string, courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .single();

  return !!data;
}

export async function updateLessonProgress(input: {
  lessonId: string;
  courseId: string;
  progressPct: number;
  lastPositionSeconds: number;
}): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const auth = await getAuthenticatedStudent();
    if ("error" in auth) return { error: auth.error };
    const { student } = auth;

    const enrolled = await verifyEnrollment(student.id, input.courseId);
    if (!enrolled) return { error: "Not enrolled in this course" };

    const isCompleted = input.progressPct >= 90;
    const service = createServiceClient();

    const { error } = await service.from("student_progress").upsert(
      {
        student_id: student.id,
        lesson_id: input.lessonId,
        course_id: input.courseId,
        status: isCompleted ? "completed" : "in_progress",
        progress_pct: input.progressPct,
        last_position_seconds: input.lastPositionSeconds,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,lesson_id" }
    );

    if (error) return { error: "Failed to update progress" };
    return { data: { updated: true } };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function markLessonComplete(
  lessonId: string,
  courseId: string
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const auth = await getAuthenticatedStudent();
    if ("error" in auth) return { error: auth.error };
    const { student } = auth;

    const enrolled = await verifyEnrollment(student.id, courseId);
    if (!enrolled) return { error: "Not enrolled in this course" };

    const service = createServiceClient();

    const { error } = await service.from("student_progress").upsert(
      {
        student_id: student.id,
        lesson_id: lessonId,
        course_id: courseId,
        status: "completed",
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" }
    );

    if (error) return { error: "Failed to mark lesson complete" };
    return { data: { completed: true } };
  } catch {
    return { error: "Something went wrong" };
  }
}
