"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface McqSingleProps {
  options: string[];
  correctIndex: number;
  onChange: (options: string[], correctIndex: number) => void;
  readOnly?: boolean;
}

export function McqSingle({
  options,
  correctIndex,
  onChange,
  readOnly,
}: McqSingleProps) {
  function addOption() {
    if (options.length >= 6) return;
    onChange([...options, ""], correctIndex);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== idx);
    let nextCorrect = correctIndex;
    if (idx === correctIndex) nextCorrect = 0;
    else if (idx < correctIndex) nextCorrect = correctIndex - 1;
    onChange(next, nextCorrect);
  }

  function updateOption(idx: number, value: string) {
    const next = [...options];
    next[idx] = value;
    onChange(next, correctIndex);
  }

  const labels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => !readOnly && onChange(options, idx)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
              idx === correctIndex
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
            disabled={readOnly}
          >
            {labels[idx]}
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
      ))}
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
    </div>
  );
}
