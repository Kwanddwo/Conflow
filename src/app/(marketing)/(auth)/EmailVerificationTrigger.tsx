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
import { trpc } from "@/server/client";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function EmailVerificationTrigger({
  email,
  from,
}: {
  email: string;
  from: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { mutate: sendVerificationEmail, isPending } =
    trpc.auth.sendVerificationEmail.useMutation({
      onSuccess: () => {
        setSent(true);
      },
      onError: (err) => {
        console.error("Failed to send verification:", err);
        setError("Failed to send verification email. Try again.");
      },
    });
  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    sendVerificationEmail({ email, from: from });
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
              : "Submit your email address and we will send you a link to verify it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isPending || sent}
            >
              {isPending ? "Sending..." : "Send Verification Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
