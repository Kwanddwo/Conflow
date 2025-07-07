"use client";
import { AppSidebar } from '@/components/app-sidebar';
import ProtectedPage from '@/components/ProtectedPage';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react'
import DashboardHeader from './DashboardHeader';
function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <ProtectedPage>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedPage>
  );
}

export default DashboardLayout;