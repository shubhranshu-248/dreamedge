"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/student/course-card";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  class: string | null;
  subject: string | null;
  teacher_name: string | null;
  student_count: number | null;
  rating_avg: number | null;
}

interface PopularCoursesProps {
  courses: Course[];
}

function PlaceholderCard({ index }: { index: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-orange/10 to-brand-blue/10">
        <span className="text-2xl font-bold text-muted-foreground/30">
          Coming Soon
        </span>
      </div>
      <div className="p-4">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
        <div className="mt-4 h-6 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export function PopularCourses({ courses }: PopularCoursesProps) {
  const hasCourses = courses.length > 0;

  return (
    <section className="bg-muted/30 py-16 sm:py-20 lg:py-24 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Popular Courses
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our most enrolled courses loved by students across India.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden items-center gap-1 text-sm font-medium text-brand-orange transition-colors hover:text-brand-orange-dark sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hasCourses
            ? courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  slug={course.slug}
                  thumbnailUrl={course.thumbnail_url}
                  price={course.price}
                  originalPrice={course.original_price}
                  className={course.class}
                  subject={course.subject}
                  teacherName={course.teacher_name}
                  studentCount={course.student_count}
                  ratingAvg={course.rating_avg}
                />
              ))
            : Array.from({ length: 3 }, (_, i) => (
                <PlaceholderCard key={i} index={i} />
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-orange"
          >
            View All Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
