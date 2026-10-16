import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Classes | Dream Edge Admin",
};

export default function LiveClassesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Live Classes</h1>
      <p className="text-muted-foreground">
        Live class scheduling and management is coming soon.
      </p>
    </div>
  );
}
