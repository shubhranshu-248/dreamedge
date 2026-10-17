"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/student/auth/password-input";
import { loginStudent } from "@/app/(student)/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginStudent(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-orange mb-4">
            <span className="text-white font-bold text-xl tracking-tight">
              DE
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to your Dream Edge account
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-orange hover:text-brand-orange-dark transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                minLength={8}
                autoComplete="current-password"
                disabled={pending}
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-10 bg-brand-orange text-white hover:bg-brand-orange-dark"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-brand-orange hover:text-brand-orange-dark font-medium transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
