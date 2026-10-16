import type { ContentStatus } from "./database";

export interface CourseCategory {
  id: string;
  name: string;
  thumbnail_url: string | null;
  weight: number;
  created_at: string;
}

export interface CourseWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  price: number;
  discount_price: number | null;
  validity_days: number;
  language: string;
  status: ContentStatus;
  is_featured: boolean;
  difficulty: string | null;
  meta: Record<string, string> | null;
  total_students: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  course_categories: CourseCategory | null;
  enrollment_count: number;
}

export type CourseLanguage = "hindi" | "english" | "hinglish";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced";
