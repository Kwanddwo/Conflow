"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Add redirect: false to handle the redirect manually
      await signOut({
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center main-content-height    space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Sign Out</h1>
      <p className="text-muted-foreground">
        Are you sure you want to sign out?
      </p>

      {isSigningOut ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-muted-foreground">Signing out...</span>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Button onClick={handleSignOut} variant="destructive">
            Yes, Sign Out
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default SignOut;
