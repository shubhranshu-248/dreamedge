"use client";

import { AnimatedCounter } from "@/components/student/animated-counter";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

interface StatsBarProps {
  stats?: Stat[];
}

const DEFAULT_STATS: Stat[] = [
  { value: 1000, suffix: "+", label: "Students" },
  { value: 50, suffix: "+", label: "Courses" },
  { value: 100, suffix: "+", label: "Hours of Content" },
  { value: 4.8, suffix: "★", label: "Rating" },
];

export function StatsBar({ stats }: StatsBarProps) {
  const items = stats ?? DEFAULT_STATS;

  return (
    <section className="border-y border-border bg-muted/50 dark:bg-white/5">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-brand-orange sm:text-3xl">
              {stat.value % 1 !== 0 ? (
                <span>
                  {stat.value}
                  {stat.suffix}
                </span>
              ) : (
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={1800}
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
