"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";

interface Pair {
  left: string;
  right: string;
}

interface MatchPairProps {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
  readOnly?: boolean;
}

export function MatchPair({ pairs, onChange, readOnly }: MatchPairProps) {
  function addPair() {
    if (pairs.length >= 8) return;
    onChange([...pairs, { left: "", right: "" }]);
  }

  function removePair(idx: number) {
    if (pairs.length <= 2) return;
    onChange(pairs.filter((_, i) => i !== idx));
  }

  function updatePair(idx: number, side: "left" | "right", value: string) {
    const next = [...pairs];
    next[idx] = { ...next[idx], [side]: value };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="flex-1">Column A</span>
        <span className="w-6" />
        <span className="flex-1">Column B</span>
        <span className="w-7" />
      </div>
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {readOnly ? (
            <>
              <span className="flex-1 text-sm">{pair.left}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm">{pair.right}</span>
            </>
          ) : (
            <>
              <Input
                value={pair.left}
                onChange={(e) => updatePair(idx, "left", e.target.value)}
                placeholder={`Item ${idx + 1}`}
                className="h-9 flex-1"
              />
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                value={pair.right}
                onChange={(e) => updatePair(idx, "right", e.target.value)}
                placeholder={`Match ${idx + 1}`}
                className="h-9 flex-1"
              />
              {pairs.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removePair(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      ))}
      {!readOnly && pairs.length < 8 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addPair}
          className="mt-1 text-muted-foreground"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Pair
        </Button>
      )}
    </div>
  );
}
