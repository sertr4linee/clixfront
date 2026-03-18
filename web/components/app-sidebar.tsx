"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  IconHome,
  IconSearch,
  IconBookmark,
  IconList,
  IconCalendar,
  IconMessage,
  IconAnalytics,
  IconAutomation,
  IconX,
} from "@/components/layout/icons"
import { useAuthStatus } from "@/lib/hooks/use-mcp"

const navItems = [
  { title: "Home", url: "/feed", icon: IconHome },
  { title: "Explore", url: "/search", icon: IconSearch },
  { title: "Bookmarks", url: "/bookmarks", icon: IconBookmark },
  { title: "Lists", url: "/lists", icon: IconList },
  { title: "Scheduled", url: "/scheduled", icon: IconCalendar },
  { title: "Messages", url: "/dms", icon: IconMessage },
  { title: "Analytics", url: "/analytics", icon: IconAnalytics },
  { title: "Automations", url: "/automations", icon: IconAutomation },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: auth } = useAuthStatus()

  const user = {
    name: auth?.account || "Account",
    email: "@" + (auth?.account || "user"),
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="clix" render={<Link href="/feed" />}>
              <div className="flex size-8 items-center justify-center">
                <IconX size={22} />
              </div>
              <span className="font-bold text-lg tracking-tight">clix</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={<Link href={item.url} />}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
