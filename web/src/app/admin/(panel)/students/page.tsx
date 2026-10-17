import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentTable } from "@/components/admin/students/student-table";
import { fetchStudents, fetchCoursesList } from "./actions";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function StudentTableLoader() {
  const [studentsResult, courses] = await Promise.all([
    fetchStudents({ page: 1, pageSize: 20 }),
    fetchCoursesList(),
  ]);

  return (
    <StudentTable
      initialData={(studentsResult.data ?? []) as unknown as Parameters<typeof StudentTable>[0]["initialData"]}
      initialCount={studentsResult.count ?? 0}
      courses={courses}
    />
  );
}

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-1">
          Manage student profiles, track enrollments, and monitor progress.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <StudentTableLoader />
      </Suspense>
    </div>
  );
}
