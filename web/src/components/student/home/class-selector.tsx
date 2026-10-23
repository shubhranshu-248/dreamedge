import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

const CLASSES = [
  { value: "6", label: "Class 6", tagline: "Build the base" },
  { value: "7", label: "Class 7", tagline: "Deepen concepts" },
  { value: "8", label: "Class 8", tagline: "Think in systems" },
  { value: "9", label: "Class 9", tagline: "CBSE foundation" },
  { value: "10", label: "Class 10", tagline: "Ace boards" },
] as const;

export function ClassSelector() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
              Pick your path
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Which class are you in?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Jump straight to courses built around your syllabus.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden items-center gap-1 text-sm font-medium text-brand-orange transition-colors hover:text-brand-orange-dark sm:inline-flex"
          >
            Browse everything
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CLASSES.map((c) => (
            <Link
              key={c.value}
              href={`/courses?class=${c.value}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-orange/60 hover:shadow-lg hover:shadow-brand-orange/10"
            >
              {/* Hover accent */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-orange/0 transition-colors group-hover:bg-brand-orange/10" />
              <div className="relative flex h-full flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-bold text-foreground">
                  {c.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.tagline}
                </p>
                <div className="mt-3 inline-flex items-center text-xs font-medium text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
                  See courses
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
