import { Suspense } from "react";
import { TestListClient } from "@/components/admin/tests/test-list-client";
import { fetchTests, fetchCourses } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Test Series — Dream Edge Admin" };

async function TestListLoader() {
  const [testsResult, coursesResult] = await Promise.all([
    fetchTests(),
    fetchCourses(),
  ]);

  return (
    <TestListClient
      tests={testsResult.data || []}
      courses={coursesResult.data || []}
    />
  );
}

function TestListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense fallback={<TestListSkeleton />}>
      <TestListLoader />
    </Suspense>
  );
}
