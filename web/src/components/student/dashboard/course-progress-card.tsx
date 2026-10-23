"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseProgressCardProps {
  title: string;
  thumbnailUrl: string | null;
  progress: number;
  lastAccessed: string | null;
  slug: string;
  className?: string | null;
}

export function CourseProgressCard({
  title,
  thumbnailUrl,
  progress,
  lastAccessed,
  slug,
  className: courseClass,
}: CourseProgressCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card sm:flex-row">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-orange/20 to-brand-blue/20 sm:aspect-auto sm:w-40 lg:w-48">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[6rem] items-center justify-center">
            <span className="text-2xl font-bold text-brand-orange/40">DE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground">
              {title}
            </h3>
            {courseClass && (
              <Badge
                variant="secondary"
                className="shrink-0 text-xs"
              >
                {courseClass}
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {progress}% complete
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-orange transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {lastAccessed && (
            <p className="text-xs text-muted-foreground">
              Last accessed {formatRelativeTime(lastAccessed)}
            </p>
          )}
          <Button
            size="sm"
            className="ml-auto bg-brand-orange text-white hover:bg-brand-orange-dark"
            render={<Link href={`/courses/${slug}`} />}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
