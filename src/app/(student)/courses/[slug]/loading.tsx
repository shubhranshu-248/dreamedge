export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-5 w-full animate-pulse rounded bg-muted" />
          <div className="mt-4 flex gap-3">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-8 aspect-video w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="rounded-xl border border-border p-6">
            <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-4 h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
