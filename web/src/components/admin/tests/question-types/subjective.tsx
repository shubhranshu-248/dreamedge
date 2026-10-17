"use client";

import { Textarea } from "@/components/ui/textarea";

interface SubjectiveProps {
  guidelines: string;
  onChange: (guidelines: string) => void;
  readOnly?: boolean;
}

export function Subjective({ guidelines, onChange, readOnly }: SubjectiveProps) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2">
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Manual grading required — this question will be flagged for review
        </p>
      </div>
      {readOnly ? (
        guidelines && (
          <p className="text-sm text-muted-foreground">
            Grading guidelines: {guidelines}
          </p>
        )
      ) : (
        <Textarea
          value={guidelines}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Grading guidelines or model answer (visible only to admins)"
          rows={3}
        />
      )}
    </div>
  );
}
