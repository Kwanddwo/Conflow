"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/server/client";
import { RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface CooldownData {
  endTime: number;
  multiplier: number;
  count: number;
}

const getCooldownData = (email: string) => {
  if (typeof window === "undefined") return null;
  const key = `email_cooldown_${email}`;
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setCooldownData = (email: string, data: CooldownData) => {
  if (typeof window === "undefined") return;
  const key = `email_cooldown_${email}`;
  sessionStorage.setItem(key, JSON.stringify(data));
};

function Page() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [cooldownTime, setCooldownTime] = useState(0);
  const [cooldownMultiplier, setCooldownMultiplier] = useState(1);
  const [resendCount, setResendCount] = useState(0);
  useEffect(() => {
    const savedData = getCooldownData(email);
    if (savedData) {
      const { endTime, multiplier, count } = savedData;
      const now = Date.now();

      if (endTime > now) {
        setCooldownTime(Math.ceil((endTime - now) / 1000));
        setCooldownMultiplier(multiplier);
        setResendCount(count);
        setSent(true);
      } else {
        setCooldownMultiplier(multiplier);
        setResendCount(count);
        setSent(count > 0);
      }
    }
  }, [email]);
  const { mutate: sendResetPassRequest, isPending } =
    trpc.auth.sendResetPassRequest.useMutation({
      onSuccess: () => {
        setSent(true);
        setError("");
        const baseTime = 60;
        const newCooldownTime = baseTime * cooldownMultiplier;
        const endTime = Date.now() + newCooldownTime * 1000;
        setCooldownTime(newCooldownTime);
        const newMultiplier = cooldownMultiplier * 5;
        const newCount = resendCount + 1;

        setCooldownMultiplier(newMultiplier);
        setResendCount(newCount);
        setCooldownData(email, {
          endTime,
          multiplier: newMultiplier,
          count: newCount,
        });
      },
      onError: (err) => {
        console.error("Failed to send verification:", err);
        toast.error(
          err.message ||
            "Failed to send password reset email. Please try again."
        );
        setError("Failed to send password reset email. Please try again.");
      },
    });
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);
  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    sendResetPassRequest({ email, from: "forgot-password" });
  }
  function handleResend() {
    if (cooldownTime > 0) return;
    sendResetPassRequest({ email, from: "forgot-password" });
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <RotateCcw className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <CardDescription>
            {sent
              ? "We've sent a password reset link to your email. Please check your inbox and click the link to reset your password."
              : "To reset your password, enter your email address below. We'll send you a secure link to create a new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending || sent}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!sent ? (
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send Password Reset Link"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  disabled={isPending || cooldownTime > 0}
                  onClick={handleResend}
                >
                  {isPending
                    ? "Sending..."
                    : cooldownTime > 0
                    ? `Resend in ${formatTime(cooldownTime)}`
                    : "Resend Reset Link"}
                </Button>

                {resendCount > 0 && cooldownTime === 0 && (
                  <Alert>
                    <AlertDescription className="text-sm text-muted-foreground text-center">
                      Next cooldown will be {(60 * cooldownMultiplier) / 60}{" "}
                      minute(s)
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
