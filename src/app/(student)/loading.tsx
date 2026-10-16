import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-brand-orange/80 to-brand-blue/80 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-6 w-40 rounded-full bg-white/20" />
          <Skeleton className="mt-4 h-12 w-3/4 bg-white/20 sm:w-1/2" />
          <Skeleton className="mt-3 h-12 w-2/3 bg-white/20 sm:w-2/5" />
          <Skeleton className="mt-4 h-5 w-full bg-white/15 sm:w-96" />
          <div className="mt-8 flex gap-4">
            <Skeleton className="h-12 w-40 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-40 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="border-y border-border bg-muted/50 px-4 py-10">
        <div className="mx-auto flex max-w-7xl justify-around">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Features skeleton */}
      <div className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mx-auto h-8 w-48" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
