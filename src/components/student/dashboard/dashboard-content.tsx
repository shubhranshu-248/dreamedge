"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Trophy,
  ArrowRight,
  Search,
  UserCircle,
  HelpCircle,
  Share2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatCard } from "./stat-card";
import { CourseProgressCard } from "./course-progress-card";

interface DashboardStats {
  enrolledCourses: number;
  completedLessons: number;
  hoursLearned: number;
  avgScore: number;
}

interface Enrollment {
  id: string;
  purchased_at: string;
  valid_until: string | null;
  status: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    class: string | null;
  } | null;
}

interface DashboardContentProps {
  student: {
    id: string;
    full_name: string;
    email: string;
    referral_code: string | null;
    class: string | null;
    [key: string]: unknown;
  };
  enrollments: Enrollment[];
  stats: DashboardStats;
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function copyReferralCode(code: string) {
  navigator.clipboard.writeText(code).then(
    () => toast.success("Referral code copied!"),
    () => toast.error("Failed to copy")
  );
}

const QUICK_ACTIONS = [
  {
    icon: Search,
    label: "Browse Courses",
    href: "/courses",
  },
  {
    icon: UserCircle,
    label: "My Profile",
    href: "/dashboard/profile",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    href: "/contact",
  },
] as const;

export function DashboardContent({
  student,
  enrollments,
  stats,
}: DashboardContentProps) {
  const firstName = getFirstName(student.full_name);
  const initials = getInitials(student.full_name);
  const today = formatDate(new Date());

  const coursesWithData = enrollments.filter((e) => e.course != null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-orange/5 via-brand-orange/3 to-transparent p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange text-lg font-semibold text-white sm:h-14 sm:w-14">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={stats.enrolledCourses}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Lessons"
          value={stats.completedLessons}
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value={stats.hoursLearned}
        />
        <StatCard
          icon={Trophy}
          label="Avg. Score"
          value={`${stats.avgScore}%`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* My Courses — Left 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Courses
            </h2>
            {coursesWithData.length > 4 && (
              <Link
                href="/dashboard/courses"
                className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {coursesWithData.length > 0 ? (
            <div className="mt-4 space-y-4">
              {coursesWithData.slice(0, 4).map((enrollment) => (
                <CourseProgressCard
                  key={enrollment.id}
                  title={enrollment.course!.title}
                  thumbnailUrl={enrollment.course!.thumbnail_url}
                  progress={0}
                  lastAccessed={enrollment.purchased_at}
                  slug={enrollment.course!.slug}
                  className={enrollment.course!.class}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No courses yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Browse our courses and start learning today
              </p>
              <Button
                className="mt-5 bg-brand-orange text-white hover:bg-brand-orange-dark"
                render={<Link href="/courses" />}
              >
                Browse Courses
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions — Right 1/3 */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="mt-4 rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <action.icon className="h-4.5 w-4.5 text-muted-foreground" />
                  {action.label}
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Link>
              ))}

              {/* Referral code action */}
              {student.referral_code && (
                <button
                  onClick={() => copyReferralCode(student.referral_code!)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Share2 className="h-4.5 w-4.5 text-muted-foreground" />
                  Share Referral Code
                  <Copy className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
          <Clock className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No activity yet. Start a course to see your progress here.
          </p>
        </div>
      </div>
    </div>
  );
}
