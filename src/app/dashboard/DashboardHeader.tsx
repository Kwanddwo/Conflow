import { Breadcrumb, BreadcrumbItem, BreadcrumbList} from '@/components/ui/breadcrumb'
import { ModeToggle } from '@/components/ui/modeToggle'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

function DashboardHeader() {
  return (
    <header className="flex justify-between items-center h-16 py-3 px-5.5 border-border border-b-1">
       <div className="flex flex-1 items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-4">
          <ModeToggle />
        </div>
      </header>
  )
}

export default DashboardHeader
