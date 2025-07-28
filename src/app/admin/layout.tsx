"use client";
import Logo from "@/components/Logo";
import AdminPage from "@/components/AdminPage";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modeToggle";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminPage>
      <header className="flex justify-between items-center h-16 py-3 px-5.5 border-border border-b-1">
        <div className="flex items-center gap-2">
          <Logo height={120} width={110} link="/admin" />
          <span className="text-xl text-foreground font-bold">Admin</span>
        </div>
        <nav className="flex items-center gap-8">
          <Link
            href="/admin/conference-requests"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Conference Requests
          </Link>
          <Link
            href="/admin/inbox"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Inbox
          </Link>
        </nav>
        <div className="flex gap-4">
          <Button
            className="cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            Sign Out
          </Button>
          <ModeToggle />
        </div>
      </header>
      {children}
    </AdminPage>
  );
}

export default AdminLayout;