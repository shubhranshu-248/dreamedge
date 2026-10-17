import type { Course as AdminCourse } from "./database";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  class: string | null;
  subject: string | null;
  teacher_name: string | null;
  teacher_avatar_url: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  duration_hours: number | null;
  total_lessons: number;
  difficulty: string;
  is_published: boolean;
  is_featured: boolean;
  student_count: number;
  rating_avg: number | null;
  rating_count: number;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  thumbnail_url: string | null;
  weight: number;
  created_at: string;
}

export type CourseWithCategory = AdminCourse & {
  course_categories: CourseCategory | null;
  enrollment_count: number;
};
