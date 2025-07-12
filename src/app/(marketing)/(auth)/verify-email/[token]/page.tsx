"use client";
import { Button } from "@/components/ui/button";
import { trpc } from "@/server/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const clearCooldownData = (email: string | null) => {
  if (typeof window === "undefined") return;
  const key = `email_cooldown_${email}`;
  sessionStorage.removeItem(key);
};
function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const token = params.token as string;
  const router = useRouter();

  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const resetPassTokenMutation =
    trpc.auth.resetPassTokenVerification.useMutation({
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Token verified successfully!");
          setStatus("success");
          clearCooldownData(res.email);
          router.push(`/sign-in/forgot-password/reset-password/${res.userId}`);
        } else {
          toast.error("Invalid token.");
          setStatus("error");
        }
      },
      onError: () => {
        toast.error("Verification failed.");
        setStatus("error");
      },
    });
  const verifyMutation = trpc.auth.verifyEmailToken.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Email verified successfully!");
        setStatus("success");
        clearCooldownData(res.email);
        if (from === "sign-in") {
          router.push("/dashboard");
        } else if (from === "sign-up") {
          router.push("/sign-in");
        }
      } else {
        toast.error("Invalid token.");
        setStatus("error");
      }
    },
    onError: () => {
      toast.error("Verification failed.");
      setStatus("error");
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link.");
      router.push("/sign-in");
      return;
    }
    setStatus("verifying");
    if (from === "forgot-password") {
      resetPassTokenMutation.mutate({ token });
    } else {
      verifyMutation.mutate({ token });
    }
  }, [token]);

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="main-content-height flex flex-col justify-center items-center space-y-4">
      {status === "verifying" ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying your email...</p>
        </>
      ) : status === "error" ? (
        <>
          <div className="text-center">
            <p className="text-destructive mb-4">
              Verification failed. Please try again.
            </p>
          </div>
          <Button
            onClick={handleBackToHome}
            className="px-6 py-2 text-white rounded-lg cursor-pointer"
          >
            Back to home page
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default Page;
