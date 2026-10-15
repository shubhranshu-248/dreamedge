"use client";

import { useState } from "react";
import { signIn } from "./actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#F26A21] mb-4">
            <span className="text-white font-bold text-xl tracking-tight">DE</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Dream Edge</h1>
          <p className="text-sm text-[#8892A0] mt-1">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-white/10 bg-[#16223B]/50 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#F26A21] focus:outline-none focus:ring-1 focus:ring-[#F26A21] transition-colors"
                placeholder="admin@dreamedge.online"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#F26A21] focus:outline-none focus:ring-1 focus:ring-[#F26A21] transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#F26A21] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d95d1b] focus:outline-none focus:ring-2 focus:ring-[#F26A21] focus:ring-offset-2 focus:ring-offset-[#0D0D0D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8892A0] mt-6">
          Only authorized team members can access the admin panel.
        </p>
      </div>
    </div>
  );
}
