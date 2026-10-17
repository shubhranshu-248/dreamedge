export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  sort_order: number;
  is_free_preview: boolean;
  is_published: boolean;
  resources: { name: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_pct: number;
  last_position_seconds: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress | null;
}
