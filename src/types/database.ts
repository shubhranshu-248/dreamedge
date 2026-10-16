// Core database types — matches the Supabase schema
// These will be auto-generated later with `supabase gen types typescript`
// For now, manual types for the most-used tables

export type UserRole =
  | "super_admin"
  | "content_creator"
  | "teacher"
  | "accountant"
  | "support_staff"
  | "technical";

export type ContentStatus = "draft" | "published" | "archived";
export type ContentType = "video" | "pdf" | "note" | "ebook" | "pyp" | "quiz";
export type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "true_false"
  | "short_answer"
  | "match_pair"
  | "subjective"
  | "image_based";
export type OrderStatus = "pending" | "completed" | "failed" | "refunded";
export type EnrollmentStatus = "active" | "expired" | "cancelled";

export interface Course {
  id: string;
  category_id: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  color_code: string;
  weight: number;
  is_visible: boolean;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  weight: number;
  is_visible: boolean;
}

export interface ContentItem {
  id: string;
  topic_id: string;
  type: ContentType;
  title: string;
  description: string | null;
  file_url: string | null;
  video_id: string | null;
  duration_seconds: number | null;
  is_paid: boolean;
  is_downloadable: boolean;
  is_printable: boolean;
  play_limit: number | null;
  status: ContentStatus;
  weight: number;
  metadata: Record<string, unknown> | null;
}

export interface Student {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  class: string | null;
  board: string | null;
  referral_code: string | null;
  wallet_balance: number;
  status: "active" | "inactive" | "blocked";
  created_at: string;
}

export interface Order {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  status: OrderStatus;
  invoice_url: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
}

export type TestStatus = "draft" | "published" | "archived";
export type Difficulty = "easy" | "medium" | "hard";

export interface Test {
  id: string;
  course_id: string | null;
  name: string;
  instructions: string | null;
  duration_min: number;
  max_attempts: number;
  shuffle: boolean;
  pass_pct: number;
  show_results: boolean;
  certificate_enabled: boolean;
  negative_marking: boolean;
  status: TestStatus;
  created_at: string;
  updated_at: string;
}

export interface TestWithCourse extends Test {
  course: { id: string; name: string } | null;
  question_count: number;
}

export interface Question {
  id: string;
  test_id: string;
  type: QuestionType;
  content: string;
  options: Record<string, unknown> | null;
  correct_answer: string | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
  weight: number;
}

export interface QuestionBankItem {
  id: string;
  type: QuestionType;
  content: string;
  options: Record<string, unknown> | null;
  correct_answer: string | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface LiveClass {
  id: string;
  course_id: string;
  teacher_id: string | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
  recording_url: string | null;
}
