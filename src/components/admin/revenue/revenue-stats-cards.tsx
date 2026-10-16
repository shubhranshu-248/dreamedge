"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { RevenueStats } from "@/app/admin/(panel)/revenue/actions";
import { percentChange } from "@/lib/format";

interface RevenueStatsCardsProps {
  stats: RevenueStats;
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  const change = percentChange(current, previous);
  if (change === null) return null;

  const isPositive = change >= 0;
  return (
    <span
      className={`text-xs font-medium ${
        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

const CARDS = [
  {
    key: "revenue" as const,
    label: "Total Revenue",
    icon: IndianRupee,
    format: (v: number) => formatINR(v),
    currentKey: "totalRevenue" as const,
    prevKey: "prevTotalRevenue" as const,
  },
  {
    key: "orders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    format: (v: number) => v.toLocaleString("en-IN"),
    currentKey: "totalOrders" as const,
    prevKey: "prevTotalOrders" as const,
  },
  {
    key: "aov" as const,
    label: "Avg Order Value",
    icon: TrendingUp,
    format: (v: number) => formatINR(v),
    currentKey: "avgOrderValue" as const,
    prevKey: "prevAvgOrderValue" as const,
  },
  {
    key: "refund" as const,
    label: "Refund Rate",
    icon: RotateCcw,
    format: (v: number) => `${v.toFixed(1)}%`,
    currentKey: "refundRate" as const,
    prevKey: "prevRefundRate" as const,
    invertColor: true,
  },
] as const;

export function RevenueStatsCards({ stats }: RevenueStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const current = stats[card.currentKey];
        const previous = stats[card.prevKey];

        return (
          <Card key={card.key}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight">{card.format(current)}</p>
                <ChangeIndicator current={current} previous={previous} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function RevenueStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
