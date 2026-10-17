function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-border bg-card p-6 ${className ?? ""}`}
    >
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-3 h-8 w-1/2 rounded bg-muted" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome banner skeleton */}
      <div className="animate-pulse rounded-2xl bg-gradient-to-r from-brand-orange/5 to-transparent p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-36 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    </div>
  );
}
