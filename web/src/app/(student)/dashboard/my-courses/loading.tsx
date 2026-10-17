export default function MyCoursesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-1 h-4 w-64 animate-pulse rounded bg-muted" />

      {/* Course card grid skeleton */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
