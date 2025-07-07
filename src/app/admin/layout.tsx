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
        <Link href="/admin">
          <Logo height={120} width={110} /> Admin
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/admin/conference-requests"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            Conference Requests
          </Link>
          <Link
            href="/admin/Inbox"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
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
