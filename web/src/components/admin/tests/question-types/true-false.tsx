"use client";

interface TrueFalseProps {
  correctAnswer: "true" | "false" | null;
  onChange: (answer: "true" | "false") => void;
  readOnly?: boolean;
}

export function TrueFalse({ correctAnswer, onChange, readOnly }: TrueFalseProps) {
  return (
    <div className="flex gap-3">
      {(["true", "false"] as const).map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => !readOnly && onChange(val)}
          disabled={readOnly}
          className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-colors ${
            correctAnswer === val
              ? val === "true"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-border text-muted-foreground hover:border-foreground/30"
          }`}
        >
          {val === "true" ? "True" : "False"}
        </button>
      ))}
    </div>
  );
}
