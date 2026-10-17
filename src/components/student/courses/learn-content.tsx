"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Lock,
  Menu,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Course } from "@/types/course";

interface LearnContentProps {
  course: Course;
}

function LessonList({
  totalLessons,
  currentLesson,
  onSelect,
}: {
  totalLessons: number;
  currentLesson: number;
  onSelect?: (index: number) => void;
}) {
  const count = Math.min(totalLessons, 20);

  if (count === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-8 text-center">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No lessons available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-2 pb-4">
      {Array.from({ length: count }).map((_, i) => {
        const lessonNum = i + 1;
        const isCurrent = lessonNum === currentLesson;
        const isLocked = lessonNum > 1;

        return (
          <button
            key={lessonNum}
            onClick={() => onSelect?.(lessonNum)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              isCurrent
                ? "bg-brand-orange/10 text-brand-orange font-medium"
                : "text-foreground/80 hover:bg-muted"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                isCurrent
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {lessonNum}
            </span>
            <span className="flex-1 truncate">Lesson {lessonNum}</span>
            {isLocked && (
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SidebarContent({
  course,
  currentLesson,
  onLessonSelect,
}: {
  course: Course;
  currentLesson: number;
  onLessonSelect?: (index: number) => void;
}) {
  return (
    <>
      {/* Course info */}
      <div className="p-4">
        <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
          {course.title}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          0 of {course.total_lessons} completed
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-0 rounded-full bg-brand-orange" />
        </div>
      </div>

      {/* Divider + section heading */}
      <div className="border-t border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course Content
        </h3>
      </div>

      {/* Lesson list */}
      <LessonList
        totalLessons={course.total_lessons}
        currentLesson={currentLesson}
        onSelect={onLessonSelect}
      />
    </>
  );
}

export function LearnContent({ course }: LearnContentProps) {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleLessonSelect(index: number) {
    setCurrentLesson(index);
    setSheetOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-border bg-card md:block">
        <SidebarContent
          course={course}
          currentLesson={currentLesson}
          onLessonSelect={handleLessonSelect}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/courses/${course.slug}`} />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="line-clamp-1 text-sm font-medium text-foreground">
            {course.title}
          </h1>

          {/* Mobile menu trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="ml-auto md:hidden" />
              }
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Course Content</SheetTitle>
              </SheetHeader>
              <SidebarContent
                course={course}
                currentLesson={currentLesson}
                onLessonSelect={handleLessonSelect}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Video placeholder */}
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/10">
                <Play className="h-6 w-6 text-brand-orange" />
              </div>
              <p className="text-sm text-muted-foreground">
                Select a lesson to begin
              </p>
            </div>
          </div>

          {/* Lesson info */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">
              {course.total_lessons > 0
                ? `Lesson ${currentLesson}`
                : "Welcome"}
            </h2>
            {course.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>

          {/* Teacher info */}
          {course.teacher_name && (
            <div className="mt-6 flex items-center gap-3">
              {course.teacher_avatar_url ? (
                <img
                  src={course.teacher_avatar_url}
                  alt={course.teacher_name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/10 text-sm font-semibold text-brand-orange">
                  {course.teacher_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {course.teacher_name}
                </p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
