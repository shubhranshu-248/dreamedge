"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10">
          <Icon className="h-5 w-5 text-brand-orange" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-card-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {trend && (
            <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
