"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, X } from "lucide-react";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  presets?: boolean;
}

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
] as const;

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  presets = true,
}: DateRangeFilterProps) {
  const hasRange = dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets && (
        <div className="flex items-center gap-1">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => {
                onDateFromChange(daysAgo(p.days));
                onDateToChange(todayStr());
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-8 w-[130px] text-xs"
          placeholder="From"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-8 w-[130px] text-xs"
          placeholder="To"
        />
        {hasRange && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              onDateFromChange("");
              onDateToChange("");
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
