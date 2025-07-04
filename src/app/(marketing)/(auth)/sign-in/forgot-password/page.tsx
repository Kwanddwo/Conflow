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
import { Mail } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

function Page() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const { mutate: sendResetPassRequest, isPending } =
    trpc.auth.sendResetPassRequest.useMutation({
      onSuccess: () => {
        setSent(true);
      },
      onError: (err) => {
        console.error("Failed to send verification:", err);
        toast.error(err.message || "Failed to send verification email. Try again.");
        setError("Failed to send verification email. Try again.");
      },
    });
  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    sendResetPassRequest({ email, from: "forgot-password" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify your email
          </CardTitle>
          <CardDescription>
            {sent
              ? "A verification link has been sent to your email. Please check your inbox."
              : "Enter your email address and we&apos;ll send you a verification link."}
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending..." : "Send verification link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
