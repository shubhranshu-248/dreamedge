"use client";

import { Input } from "@/components/ui/input";

interface ShortAnswerProps {
  answers: string[];
  onChange: (answers: string[]) => void;
  readOnly?: boolean;
}

export function ShortAnswer({ answers, onChange, readOnly }: ShortAnswerProps) {
  function handleChange(value: string) {
    const parts = value.split(",").map((s) => s.trim());
    onChange(parts);
  }

  return (
    <div className="space-y-2">
      {readOnly ? (
        <p className="text-sm">
          Accepted answers:{" "}
          <span className="font-medium">{answers.join(", ")}</span>
        </p>
      ) : (
        <>
          <Input
            value={answers.join(", ")}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter accepted answers, separated by commas"
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple accepted answers with commas
          </p>
        </>
      )}
    </div>
  );
}
