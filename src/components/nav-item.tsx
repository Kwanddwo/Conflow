import { LucideIcon } from 'lucide-react';
import React from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

function NavItem( {items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavItem;
