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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
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

// Home icon — house outline matching the sidebar style
function IconFeed({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

const navMain = [
  { title: "Feed", url: "/feed", icon: IconFeed },
  { title: "Explore", url: "/search", icon: IconSearch },
  { title: "Analytics", url: "/analytics", icon: IconAnalytics },
]

const navContent = [
  { title: "Bookmarks", url: "/bookmarks", icon: IconBookmark },
  { title: "Lists", url: "/lists", icon: IconList },
  { title: "Scheduled", url: "/scheduled", icon: IconCalendar },
  { title: "Messages", url: "/dms", icon: IconMessage },
]

const navTools = [
  { title: "Automations", url: "/automations", icon: IconAutomation },
]

function NavSection({
  items,
  label,
  pathname,
}: {
  items: typeof navMain
  label?: string
  pathname: string
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                render={<Link href={item.url} />}
                className={isActive ? "font-semibold" : ""}
              >
                <item.icon size={18} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

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
                <IconX size={20} />
              </div>
              <span className="font-extrabold text-lg tracking-tight">clix</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavSection items={navMain} pathname={pathname} />
        <SidebarSeparator />
        <NavSection items={navContent} label="Content" pathname={pathname} />
        <SidebarSeparator />
        <NavSection items={navTools} label="Tools" pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
