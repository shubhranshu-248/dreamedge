import type { Course } from "./database";

export interface CourseCategory {
  id: string;
  name: string;
  thumbnail_url: string | null;
  weight: number;
  created_at: string;
}

export type CourseWithCategory = Course & {
  course_categories: CourseCategory | null;
  enrollment_count: number;
};
