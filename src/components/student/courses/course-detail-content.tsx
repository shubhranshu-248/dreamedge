"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  BookOpen,
  BarChart3,
  Globe,
  Award,
  Star,
  Users,
  Share2,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { formatRelativeTime } from "@/lib/format";
import type { Course } from "@/types/course";

interface CourseDetailContentProps {
  course: Course;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  const [expanded, setExpanded] = useState(false);

  const discount =
    course.original_price && course.original_price > course.price
      ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
      : null;

  const longText = course.long_description || course.description || "";
  const isLong = longText.length > 500;

  function handleEnroll() {
    toast.info("Enrollment coming soon!", {
      description: "Payment integration will be available shortly.",
    });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Header */}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{course.title}</h1>
          {course.description && (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {course.teacher_name && (
              <span className="text-sm font-medium">{course.teacher_name}</span>
            )}
            {course.class && (
              <Badge variant="secondary">{course.class}</Badge>
            )}
            {course.subject && (
              <Badge variant="outline">{course.subject}</Badge>
            )}
            {course.rating_avg != null && course.rating_avg > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {course.rating_avg.toFixed(1)}
                <span className="text-muted-foreground">
                  ({course.rating_count})
                </span>
              </span>
            )}
            {course.student_count > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {course.student_count.toLocaleString("en-IN")} students
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Last updated {formatRelativeTime(course.updated_at)}
          </p>

          {/* Thumbnail / Preview */}
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-blue/20">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-5xl font-bold text-brand-orange/30">DE</span>
              </div>
            )}
            {course.preview_video_url && (
              <a
                href={course.preview_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="h-7 w-7 fill-brand-orange text-brand-orange" />
                </div>
              </a>
            )}
          </div>

          {/* About */}
          {longText && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">About This Course</h2>
              <div
                className={`mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground ${
                  !expanded && isLong ? "line-clamp-6" : ""
                }`}
              >
                {longText}
              </div>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-sm font-medium text-brand-orange hover:text-brand-orange-dark"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">What You&apos;ll Learn</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Enrollment Card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Card thumbnail */}
            <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-orange/20 to-brand-blue/20">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-3xl font-bold text-brand-orange/30">DE</span>
                </div>
              )}
            </div>

            <div className="p-5">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                {course.price === 0 ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Free
                  </Badge>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-brand-orange">
                      {formatINR(course.price)}
                    </span>
                    {course.original_price != null && course.original_price > course.price && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatINR(course.original_price)}
                        </span>
                        {discount && (
                          <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                            {discount}% off
                          </Badge>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleEnroll}
                className="mt-4 w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
              >
                Enroll Now
              </button>
              <button
                onClick={handleShare}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                Share this course
              </button>

              {/* Course info */}
              <ul className="mt-6 space-y-3 text-sm">
                {course.duration_hours != null && (
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" /> Duration
                    </span>
                    <span className="font-medium">{course.duration_hours} hours</span>
                  </li>
                )}
                {course.total_lessons > 0 && (
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" /> Lessons
                    </span>
                    <span className="font-medium">{course.total_lessons}</span>
                  </li>
                )}
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" /> Difficulty
                  </span>
                  <Badge
                    variant="secondary"
                    className={`capitalize ${DIFFICULTY_COLORS[course.difficulty] ?? ""}`}
                  >
                    {course.difficulty}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" /> Language
                  </span>
                  <span className="font-medium">English + Hindi</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" /> Certificate
                  </span>
                  <span className="font-medium">Yes</span>
                </li>
              </ul>

              {/* Teacher */}
              {course.teacher_name && (
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    {course.teacher_avatar_url ? (
                      <img
                        src={course.teacher_avatar_url}
                        alt={course.teacher_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
                        {course.teacher_name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{course.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">Instructor</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
