import { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TestimonialsClient } from "@/components/admin/students/testimonials-client";
import { fetchTestimonials } from "../actions";
import type { Testimonial } from "@/types/database";

function TestimonialsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  );
}

async function TestimonialsLoader() {
  const result = await fetchTestimonials();
  return <TestimonialsClient initialData={(result.data ?? []) as Testimonial[]} />;
}

export default function TestimonialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials & Toppers</h1>
          <p className="text-muted-foreground mt-1">
            Manage student success stories displayed on the website.
          </p>
        </div>
      </div>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsLoader />
      </Suspense>
    </div>
  );
}
