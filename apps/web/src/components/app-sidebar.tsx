"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconWallet,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconChartBar,
  IconChartDonut,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Michael Roberts",
    email: "michealroberts@gmail.com",
    avatar: "/avatars/coinsafehub.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Deposit", url: "/deposit", icon: IconArrowDown },
    { title: "Withdrawal", url: "/withdrawal", icon: IconArrowUp },
    { title: "Transfer", url: "/transfer", icon: IconArrowsExchange },
    { title: "Connect Wallet", url: "/connect-wallet", icon: IconWallet },
    { title: "Plans", url: "/plans", icon: IconChartDonut },
    { title: "Crypto Charts", url: "/crypto-charts", icon: IconChartBar },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Help", url: "/help", icon: IconHelp },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Brand Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-[#1E3A8A]">
                  CoinSafeHub
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer / User */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
