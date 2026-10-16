import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Dream Edge Admin",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground">
        Platform settings and configuration are coming soon.
      </p>
    </div>
  );
}
