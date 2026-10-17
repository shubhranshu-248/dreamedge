import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/student/home/hero-section";
import { StatsBar } from "@/components/student/home/stats-bar";
import { FeaturesSection } from "@/components/student/home/features-section";
import { PopularCourses } from "@/components/student/home/popular-courses";
import { TestimonialsSection } from "@/components/student/home/testimonials-section";
import { CtaSection } from "@/components/student/home/cta-section";

export const instant = false;

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
      .select("id, student_name, class, rating, content, student_photo_url")
      .eq("is_visible", true)
      .order("weight", { ascending: false })
      .limit(6);

    return (data ?? []).map((t) => ({
      ...t,
      avatar_url: t.student_photo_url,
    }));
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
      <PopularCourses courses={courses} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaSection />
    </>
  );
}
