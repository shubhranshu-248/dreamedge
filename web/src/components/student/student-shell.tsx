"use client";

import { Navbar } from "@/components/student/navbar";
import { Footer } from "@/components/student/footer";

interface StudentShellProps {
  children: React.ReactNode;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
  };
}

export function StudentShell({ children, socialLinks }: StudentShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer socialLinks={socialLinks} />
    </div>
  );
}
