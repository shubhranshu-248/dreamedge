"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Check, Loader2 } from "lucide-react";
import type { QuestionBankItem, QuestionType, Difficulty } from "@/types/database";
import { fetchQuestionBank } from "@/app/admin/(panel)/content/tests/actions";

interface QuestionBankModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (questions: QuestionBankItem[]) => void;
}

const typeLabels: Record<string, string> = {
  mcq_single: "MCQ (Single)",
  mcq_multiple: "MCQ (Multiple)",
  true_false: "True/False",
  short_answer: "Short Answer",
  match_pair: "Match Pair",
  subjective: "Subjective",
  image_based: "Image",
};

export function QuestionBankModal({
  open,
  onClose,
  onImport,
}: QuestionBankModalProps) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "all">("all");
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    startTransition(async () => {
      const result = await fetchQuestionBank();
      if (result.data) setQuestions(result.data as unknown as QuestionBankItem[]);
    });
  }, [open]);

  const filtered = questions.filter((q) => {
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    if (search && !q.content.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleImport() {
    const items = questions.filter((q) => selected.has(q.id));
    onImport(items);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import from Question Bank</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="h-9 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as QuestionType | "all")
              }
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="all">All Types</option>
              {(Object.keys(typeLabels) as QuestionType[]).map((t) => (
                <option key={t} value={t}>
                  {typeLabels[t]}
                </option>
              ))}
            </select>
            <select
              value={diffFilter}
              onChange={(e) =>
                setDiffFilter(e.target.value as Difficulty | "all")
              }
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {selected.size > 0 && (
              <Badge variant="secondary">{selected.size} selected</Badge>
            )}
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-border">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No questions found
              </div>
            ) : (
              filtered.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleSelect(q.id)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                    selected.has(q.id)
                      ? "bg-brand-orange/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      selected.has(q.id)
                        ? "border-brand-orange bg-brand-orange text-white"
                        : "border-border"
                    }`}
                  >
                    {selected.has(q.id) && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{q.content}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{typeLabels[q.type]}</span>
                      <span className="capitalize">{q.difficulty}</span>
                      {q.topic_tag && <span>{q.topic_tag}</span>}
                      <span>Used {q.used_count}x</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selected.size === 0}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white"
          >
            Import {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
