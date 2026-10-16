import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/student/home/hero-section";

export const instant = false;
import { StatsBar } from "@/components/student/home/stats-bar";
import { FeaturesSection } from "@/components/student/home/features-section";
import { PopularCourses } from "@/components/student/home/popular-courses";
import { TestimonialsSection } from "@/components/student/home/testimonials-section";
import { CtaSection } from "@/components/student/home/cta-section";

async function fetchCourses() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select(
        "id, title, slug, thumbnail_url, price, original_price, class, subject, teacher_name, student_count, rating_avg",
      )
      .eq("is_published", true)
      .order("student_count", { ascending: false })
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

async function fetchTestimonials() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("testimonials")
      .select("id, student_name, class, rating, content, avatar_url")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [courses, testimonials] = await Promise.all([
    fetchCourses(),
    fetchTestimonials(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <PopularCourses courses={courses as any[]} />
      <TestimonialsSection testimonials={testimonials as any[]} />
      <CtaSection />
    </>
  );
}
