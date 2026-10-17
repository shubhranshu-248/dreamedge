import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/student/home/hero-section";
import { FeaturesSection } from "@/components/student/home/features-section";
import { PopularCourses } from "@/components/student/home/popular-courses";
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

export default async function HomePage() {
  const courses = await fetchCourses();

  return (
    <>
      <HeroSection />
      <PopularCourses courses={courses} />
      <FeaturesSection />
      <CtaSection />
    </>
  );
}
