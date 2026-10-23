"use client";

// Supabase dashboard requirement:
//   Auth -> Providers -> Phone must be enabled with an SMS provider
//   (Twilio or MSG91).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  startPhoneOtp,
  verifyPhoneOtp,
} from "@/app/(student)/auth/actions";

export function PhoneAuthForm({
  mode,
}: {
  mode: "login" | "register";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");

  function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await startPhoneOtp(phone);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setVerifiedPhone(result.data?.phone ?? phone);
      setStep("otp");
      toast.success("OTP sent. Check your SMS.");
    });
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await verifyPhoneOtp(verifiedPhone, otp);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (mode === "register" || result.data?.isNew) {
        toast.success("Welcome to Dream Edge!");
      } else {
        toast.success("Logged in.");
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleStart} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone-input">Mobile number</Label>
          <div className="flex gap-2">
            <div className="flex items-center justify-center h-8 px-3 rounded-lg border border-input bg-muted/40 text-sm font-medium text-muted-foreground">
              +91
            </div>
            <Input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={pending}
              maxLength={13}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll send a one-time code via SMS. Indian numbers only.
          </p>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-10 bg-brand-orange text-white hover:bg-brand-orange-dark"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending OTP…
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp-input">Enter OTP</Label>
        <Input
          id="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          disabled={pending}
          maxLength={8}
          className="tracking-widest text-center"
        />
        <p className="text-xs text-muted-foreground">
          Sent to <span className="font-medium">{verifiedPhone}</span>.{" "}
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
            }}
            className="text-brand-orange hover:text-brand-orange-dark"
            disabled={pending}
          >
            Change number
          </button>
        </p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-10 bg-brand-orange text-white hover:bg-brand-orange-dark"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying…
          </>
        ) : mode === "register" ? (
          "Verify & Create Account"
        ) : (
          "Verify & Login"
        )}
      </Button>
    </form>
  );
}
