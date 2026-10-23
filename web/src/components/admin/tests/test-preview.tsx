"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  ArrowRight,
} from "lucide-react";
import type { QuestionDraft } from "@/stores/test-builder";

interface TestPreviewProps {
  open: boolean;
  onClose: () => void;
  testName: string;
  durationMin: number;
  questions: QuestionDraft[];
}

const typeLabels: Record<string, string> = {
  mcq_single: "MCQ (Single)",
  mcq_multiple: "MCQ (Multiple)",
  true_false: "True/False",
  short_answer: "Short Answer",
  match_pair: "Match the Pair",
  subjective: "Subjective",
  image_based: "Image Based",
};

export function TestPreview({
  open,
  onClose,
  testName,
  durationMin,
  questions,
}: TestPreviewProps) {
  const [current, setCurrent] = useState(0);
  const q = questions[current];

  if (!q) return null;

  function renderStudentView() {
    const opts = (q.options || {}) as Record<string, unknown>;

    switch (q.type) {
      case "mcq_single": {
        const items = (opts.items as string[]) || [];
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                <span className="text-sm">{item || `Option ${i + 1}`}</span>
              </label>
            ))}
          </div>
        );
      }
      case "mcq_multiple": {
        const items = (opts.items as string[]) || [];
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="h-4 w-4 rounded-sm border-2 border-muted-foreground" />
                <span className="text-sm">{item || `Option ${i + 1}`}</span>
              </label>
            ))}
          </div>
        );
      }
      case "true_false":
        return (
          <div className="flex gap-3">
            {["True", "False"].map((v) => (
              <button
                key={v}
                type="button"
                className="flex-1 rounded-lg border border-border py-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                {v}
              </button>
            ))}
          </div>
        );
      case "short_answer":
        return (
          <input
            type="text"
            readOnly
            placeholder="Type your answer here..."
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        );
      case "match_pair": {
        const pairs = (opts.pairs as { left: string; right: string }[]) || [];
        return (
          <div className="space-y-2">
            {pairs.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
                  {p.left || `Item ${i + 1}`}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                  Drag to match
                </span>
              </div>
            ))}
          </div>
        );
      }
      case "subjective":
        return (
          <textarea
            readOnly
            placeholder="Write your detailed answer here..."
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        );
      case "image_based":
        return (
          <div className="space-y-3">
            {q.image_url && (
              <Image
                src={q.image_url}
                alt="Question"
                width={800}
                height={192}
                className="max-h-48 w-auto rounded-lg border border-border object-contain"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Answer area based on sub-type
            </p>
          </div>
        );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{testName}</DialogTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {durationMin}:00
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="hidden flex-col gap-1 sm:flex">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  i === current
                    ? "bg-brand-orange text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px]">
                {typeLabels[q.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {q.positive_marks} marks
              </span>
              {q.negative_marks > 0 && (
                <span className="text-xs text-red-500">
                  −{q.negative_marks}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed">
              {q.content || "Question text will appear here"}
            </p>

            {renderStudentView()}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {current + 1} of {questions.length}
          </span>
          {current < questions.length - 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white"
              onClick={onClose}
            >
              <Flag className="mr-1 h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
