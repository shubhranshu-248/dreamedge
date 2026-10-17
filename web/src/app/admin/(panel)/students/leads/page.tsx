import { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeadTable } from "@/components/admin/students/lead-table";
import { fetchLeads } from "../actions";
import type { Lead } from "@/types/database";

function LeadsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-border p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

async function LeadsLoader() {
  const result = await fetchLeads();
  return <LeadTable initialData={(result.data ?? []) as Lead[]} />;
}

export default function LeadsPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Track potential students from website, referrals, and ad campaigns.
          </p>
        </div>
      </div>

      <Suspense fallback={<LeadsSkeleton />}>
        <LeadsLoader />
      </Suspense>
    </div>
  );
}
