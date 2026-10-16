"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-brand-orange">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
          Join thousands of students excelling with Dream Edge. Strong concepts,
          expert guidance, and a path to top results — all in one place.
        </p>
        <Button
          size="lg"
          className="mt-8 rounded-full bg-white px-10 text-brand-orange shadow-lg hover:bg-white/90"
          render={<Link href="/login" />}
        >
          Get Started Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
