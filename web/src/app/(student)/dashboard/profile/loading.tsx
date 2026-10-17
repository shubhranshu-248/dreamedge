export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
      </div>

      {/* Avatar skeleton */}
      <div className="mb-8 flex flex-col items-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-28 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Personal Information card skeleton */}
      <div className="animate-pulse rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-8 w-16 rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Security card skeleton */}
      <div className="mt-6 animate-pulse rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-4 p-6">
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="space-y-3 sm:max-w-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-8 w-full rounded-lg bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-9 w-36 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Account card skeleton */}
      <div className="mt-6 animate-pulse rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
