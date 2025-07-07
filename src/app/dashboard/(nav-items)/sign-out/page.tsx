"use client";

import React, { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

function SignOut() {
  useEffect(() => {
    const Logout = () => {
      signOut({ callbackUrl: "/sign-in" });
    };
    Logout();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default SignOut;
