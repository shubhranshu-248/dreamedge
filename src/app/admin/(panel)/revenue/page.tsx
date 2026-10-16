import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue & Analytics | Dream Edge Admin",
};

export default function RevenuePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Revenue & Analytics</h1>
      <p className="text-muted-foreground">
        Revenue tracking and financial reports are coming soon.
      </p>
    </div>
  );
}
