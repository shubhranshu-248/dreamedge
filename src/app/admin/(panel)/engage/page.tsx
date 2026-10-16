import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Engagement | Dream Edge Admin",
};

export default function EngagePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Student Engagement</h1>
      <p className="text-muted-foreground">
        Engagement tools and communication features are coming soon.
      </p>
    </div>
  );
}
