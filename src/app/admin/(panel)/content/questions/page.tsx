import { Suspense } from "react";
import { QuestionBankClient } from "@/components/admin/tests/question-bank-client";
import { fetchQuestionBank } from "../tests/actions";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Question Bank — Dream Edge Admin" };

async function QBankLoader() {
  const result = await fetchQuestionBank();
  return <QuestionBankClient questions={(result.data || []) as unknown as import("@/types/database").QuestionBankItem[]} />;
}

function QBankSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function QuestionBankPage() {
  return (
    <Suspense fallback={<QBankSkeleton />}>
      <QBankLoader />
    </Suspense>
  );
}
