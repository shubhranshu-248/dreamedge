"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";

interface McqMultipleProps {
  options: string[];
  correctIndices: number[];
  onChange: (options: string[], correctIndices: number[]) => void;
  readOnly?: boolean;
}

export function McqMultiple({
  options,
  correctIndices,
  onChange,
  readOnly,
}: McqMultipleProps) {
  function toggleCorrect(idx: number) {
    if (readOnly) return;
    const next = correctIndices.includes(idx)
      ? correctIndices.filter((i) => i !== idx)
      : [...correctIndices, idx].sort();
    onChange(options, next);
  }

  function addOption() {
    if (options.length >= 6) return;
    onChange([...options, ""], correctIndices);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== idx);
    const nextCorrect = correctIndices
      .filter((i) => i !== idx)
      .map((i) => (i > idx ? i - 1 : i));
    onChange(next, nextCorrect);
  }

  function updateOption(idx: number, value: string) {
    const next = [...options];
    next[idx] = value;
    onChange(next, correctIndices);
  }

  const labels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        const isCorrect = correctIndices.includes(idx);
        return (
          <div key={idx} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleCorrect(idx)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-xs font-semibold transition-colors ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
              disabled={readOnly}
            >
              {isCorrect ? (
                <Check className="h-4 w-4" />
              ) : (
                labels[idx]
              )}
            </button>
            {readOnly ? (
              <span className="text-sm">{opt}</span>
            ) : (
              <Input
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Option ${labels[idx]}`}
                className="h-9 flex-1"
              />
            )}
            {!readOnly && options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeOption(idx)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
      {!readOnly && options.length < 6 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addOption}
          className="mt-1 text-muted-foreground"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Option
        </Button>
      )}
      {!readOnly && (
        <p className="text-xs text-muted-foreground">
          Click multiple options to mark them as correct
        </p>
      )}
    </div>
  );
}
