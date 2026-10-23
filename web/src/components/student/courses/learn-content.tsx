"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Menu,
  BookOpen,
  FileDown,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course";
import type { LessonWithProgress } from "@/types/lesson";
import { markLessonComplete } from "@/app/(student)/courses/[slug]/learn/actions";
import { getYouTubeId, isVideoFile } from "@/lib/video";

interface LearnContentProps {
  course: Course;
  lessons: LessonWithProgress[];
}

function LessonList({
  lessons,
  currentIndex,
  onSelect,
}: {
  lessons: LessonWithProgress[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  if (lessons.length === 0) {
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
      {lessons.map((lesson, i) => {
        const isCurrent = i === currentIndex;
        const isCompleted = lesson.progress?.status === "completed";
        const isInProgress = lesson.progress?.status === "in_progress";

        return (
          <button
            key={lesson.id}
            onClick={() => onSelect(i)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              isCurrent
                ? "bg-brand-orange/10 text-brand-orange font-medium"
                : "text-foreground/80 hover:bg-muted"
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-7 w-7 shrink-0 text-green-500" />
            ) : (
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  isCurrent
                    ? "bg-brand-orange text-white"
                    : isInProgress
                      ? "bg-brand-orange/20 text-brand-orange"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {lesson.sort_order}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <span className="block truncate">{lesson.title}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {lesson.duration_minutes > 0 && (
                  <>
                    <Clock className="h-3 w-3" />
                    {lesson.duration_minutes} min
                  </>
                )}
              </span>
            </div>
            {lesson.is_free_preview && (
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] px-1.5 py-0"
              >
                <Eye className="mr-0.5 h-3 w-3" />
                Free
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SidebarContent({
  course,
  lessons,
  currentIndex,
  onLessonSelect,
}: {
  course: Course;
  lessons: LessonWithProgress[];
  currentIndex: number;
  onLessonSelect: (index: number) => void;
}) {
  const completedCount = lessons.filter(
    (l) => l.progress?.status === "completed"
  ).length;
  const total = lessons.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <>
      <div className="p-4">
        <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
          {course.title}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {completedCount} of {total} completed
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-orange transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course Content
        </h3>
      </div>

      <LessonList
        lessons={lessons}
        currentIndex={currentIndex}
        onSelect={onLessonSelect}
      />
    </>
  );
}

function VideoPlayer({ url }: { url: string }) {
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
        title="Lesson video"
        className="aspect-video w-full rounded-xl"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  if (isVideoFile(url)) {
    return (
      <video
        src={url}
        controls
        className="aspect-video w-full rounded-xl bg-black"
        controlsList="nodownload"
      />
    );
  }

  return (
    <iframe
      src={url}
      title="Lesson video"
      className="aspect-video w-full rounded-xl"
      allow="fullscreen"
      allowFullScreen
    />
  );
}

export function LearnContent({ course, lessons }: LearnContentProps) {
  const firstUncompleted = lessons.findIndex(
    (l) => l.progress?.status !== "completed"
  );
  const initialIndex =
    firstUncompleted >= 0 ? firstUncompleted : lessons.length > 0 ? 0 : -1;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [completedSet, setCompletedSet] = useState<Set<string>>(
    () =>
      new Set(
        lessons
          .filter((l) => l.progress?.status === "completed")
          .map((l) => l.id)
      )
  );
  const [isPending, startTransition] = useTransition();

  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : null;

  function handleLessonSelect(index: number) {
    setCurrentIndex(index);
    setSheetOpen(false);
  }

  function handleMarkComplete() {
    if (!currentLesson) return;
    startTransition(async () => {
      const result = await markLessonComplete(currentLesson.id, course.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCompletedSet((prev) => new Set(prev).add(currentLesson.id));
      toast.success("Lesson marked as complete!");
    });
  }

  const lessonsWithLocalState = lessons.map((l) => ({
    ...l,
    progress: completedSet.has(l.id)
      ? { ...l.progress, status: "completed" as const }
      : l.progress,
  }));

  const isCurrentCompleted = currentLesson
    ? completedSet.has(currentLesson.id)
    : false;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-border bg-card md:block">
        <SidebarContent
          course={course}
          lessons={lessonsWithLocalState as LessonWithProgress[]}
          currentIndex={currentIndex}
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto md:hidden"
                />
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
                lessons={lessonsWithLocalState as LessonWithProgress[]}
                currentIndex={currentIndex}
                onLessonSelect={handleLessonSelect}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {currentLesson ? (
            <>
              {/* Video player */}
              {currentLesson.video_url ? (
                <VideoPlayer url={currentLesson.video_url} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted-foreground/10">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No video available for this lesson
                    </p>
                    {currentLesson.description && (
                      <p className="mt-1 max-w-md text-xs text-muted-foreground/70">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson info */}
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.duration_minutes > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {currentLesson.duration_minutes} min
                      </p>
                    )}
                  </div>

                  {isCurrentCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="shrink-0 border-green-500/30 text-green-600"
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Completed
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleMarkComplete}
                      disabled={isPending}
                      className="shrink-0 bg-brand-orange text-white hover:bg-brand-orange-dark"
                    >
                      {isPending ? "Saving..." : "Mark as Complete"}
                    </Button>
                  )}
                </div>

                {currentLesson.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              {/* Resources */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="mt-6 rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Resources
                  </h3>
                  <div className="mt-3 space-y-2">
                    {currentLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted"
                      >
                        <FileDown className="h-4 w-4 text-brand-orange" />
                        {res.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher info */}
              {course.teacher_name && (
                <div className="mt-6 flex items-center gap-3">
                  {course.teacher_avatar_url ? (
                    <Image
                      src={course.teacher_avatar_url}
                      alt={course.teacher_name}
                      width={36}
                      height={36}
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
            </>
          ) : (
            /* No lesson selected / empty state */
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/10">
                  <Play className="h-6 w-6 text-brand-orange" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {lessons.length === 0
                    ? "No lessons available yet"
                    : "Select a lesson to begin"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
