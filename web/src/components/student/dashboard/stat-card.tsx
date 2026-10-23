"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  tone?: "orange" | "blue" | "green" | "amber";
  trendDirection?: "up" | "down";
}

const TONE_STYLES: Record<
  NonNullable<StatCardProps["tone"]>,
  { bg: string; fg: string }
> = {
  orange: { bg: "bg-brand-orange/10", fg: "text-brand-orange" },
  blue: { bg: "bg-brand-blue/10", fg: "text-brand-blue dark:text-sky-400" },
  green: {
    bg: "bg-emerald-500/10",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "orange",
  trendDirection = "up",
}: StatCardProps) {
  const t = TONE_STYLES[tone];
  const TrendIcon = trendDirection === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground sm:text-3xl">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                trendDirection === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.fg} transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
