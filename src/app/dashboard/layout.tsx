import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/modeToggle';
import Link from 'next/link';
import React from 'react'

function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <header className="flex justify-between items-center h-16 py-3 px-5.5 border-border border-b-1">
        <Link href="/dashboard">
          <Logo height={120} width={110} />
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard/all-conferences"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            All Conferences
          </Link>
          <Link
            href="/dashboard/my-conferences"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            My Conferences
          </Link>
          <Link
            href="/dashboard/my-roles"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            My Roles
          </Link>
          <Link
            href="/dashboard/account"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            My Account
          </Link>
          <Link
            href="/dashboard/inbox"
            className="text-[#64748b] hover:text-[#0f172a] transition-colors font-medium"
          >
            Inbox
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/sign-out">
            <Button className="cursor-pointer">Sign Out</Button>
          </Link>
          <ModeToggle />
        </div>
        </header>
          { children }
    </>
  );
}

export default DashboardLayout