import { Compass, Globe,Inbox, LogOut, ShieldCheck, UserCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Logo from "./Logo"
import NavItem from "./nav-item"

const items = [
  {
    title: "All Conferences",
    url: "/dashboard/all-conferences",
    icon: Globe,
  },
  {
    title: "My Conferences",
    url: "/dashboard/my-conferences",
    icon: Compass,
  },
  {
    title: "My Roles",
    url: "/dashboard/my-roles",
    icon: ShieldCheck,
  },
  {
    title: "Inbox",
    url: "/dashboard/inbox",
    icon: Inbox,
  },
]
const secondaryItems = [
  {
    title: "My Account",
    url: "/dashboard/account",
    icon: UserCircle,
  },
  {
    title: "Logout",
    url: "/dashboard/sign-out",
    icon: LogOut,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
        <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Logo width={100} height={100} link="/dashboard" />
        </div>
        </SidebarHeader>
      <SidebarContent>
        <NavItem items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavItem items={secondaryItems} />
      </SidebarFooter>
    </Sidebar>
  )
}