export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: "active" | "expired" | "cancelled" | "refunded";
  payment_id: string | null;
  payment_order_id: string | null;
  payment_amount: number;
  payment_method: string | null;
  payment_status: "free" | "pending" | "paid" | "failed" | "refunded";
  purchased_at: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    class: string | null;
    subject: string | null;
    teacher_name: string | null;
    total_lessons: number;
    duration_hours: number | null;
  } | null;
}
