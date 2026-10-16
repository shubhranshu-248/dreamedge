"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-orange via-brand-orange-dark to-brand-blue">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-white/5" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 sm:px-6 md:flex-row md:py-28 lg:px-8 lg:py-32">
        {/* Text content */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            Trusted by 1000+ Students
          </span>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Master Your Foundation with{" "}
            <span className="text-yellow-200">Dream Edge</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg md:mt-6">
            Premium coaching for Classes 6-10 at prices that make sense. Build
            strong concepts with IITian mentors and smart learning tools.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="rounded-full bg-white px-8 text-brand-orange shadow-lg hover:bg-white/90"
              render={<Link href="/courses" />}
            >
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
              render={<Link href="/login" />}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Free Trial
            </Button>
          </div>
        </div>

        {/* Decorative illustration */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative">
            <div className="h-72 w-72 rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-sm lg:h-80 lg:w-80">
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-white/20 bg-white/5 p-6">
                <div className="text-5xl font-black text-white lg:text-6xl">
                  DE
                </div>
                <div className="h-px w-16 bg-yellow-200/50" />
                <p className="text-center text-sm font-medium text-white/70">
                  Basic Concept Se
                  <br />
                  Top Result TK
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-xl bg-yellow-200/20 backdrop-blur-sm" />
            <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
