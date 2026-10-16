"use client";

import {
  GraduationCap,
  IndianRupee,
  Video,
  ClipboardCheck,
  MessageCircleQuestion,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Expert Teachers",
    description:
      "Learn from IITian mentors with 8+ years of teaching experience and proven results.",
  },
  {
    icon: IndianRupee,
    title: "Affordable Pricing",
    description:
      "Premium coaching at prices that make sense — quality education shouldn't break the bank.",
  },
  {
    icon: Video,
    title: "Live + Recorded",
    description:
      "Attend live classes and rewatch edited recordings anytime for revision and clarity.",
  },
  {
    icon: ClipboardCheck,
    title: "Test Series",
    description:
      "Regular assessments with detailed analysis to track progress and build exam confidence.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Doubt Resolution",
    description:
      "Get your doubts cleared quickly with dedicated support from our teaching team.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual dashboards to monitor learning, identify weak areas, and plan study sessions.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why <span className="text-brand-orange">Dream Edge</span>?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to build a strong foundation and excel in your
            studies.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
