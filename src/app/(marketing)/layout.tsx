"use client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modeToggle";
import { useSession } from "next-auth/react";
import Link from "next/link";


export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  const { status } = useSession();
  return (
    <>
      <header className="flex justify-between items-center h-16 py-3 px-5.5 border-border border-b-1">
          <Logo height={120} width={110} link="/" />
        <div className="flex gap-4">
          <Link href="/sign-up">
            <Button variant="outline" className="cursor-pointer">
              Sign Up
            </Button>
          </Link>
          {status === "authenticated" ? (
            <Link href="/dashboard">
              <Button className="cursor-pointer">Sign In</Button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button className="cursor-pointer">Sign In</Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </header>

      {children}
    </>
  );
}
