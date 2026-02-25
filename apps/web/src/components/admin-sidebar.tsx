"use client"

import * as React from "react"
import Link from "next/link"
import {
    IconDashboard,
    IconUsers,
    IconChartLine,
    IconHistory,
    IconHeadset,
    IconSettings,
    IconHelp,
    IconShieldLock,
    IconWallet,
    IconCash,
    IconBox,
    IconTransfer,
    IconSpeakerphone
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/lib/AuthProvider"
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
    navAdmin: [
        { title: "Admin Overview", url: "/admin/dashboard", icon: IconDashboard },
        { title: "User Management", url: "/admin/users", icon: IconUsers },
        { title: "Investment Plans", url: "/admin/plans", icon: IconBox },
        { title: "Global Investments", url: "/admin/investments", icon: IconChartLine },
        { title: "Deposit Requests", url: "/admin/deposits", icon: IconWallet },
        { title: "Withdrawal Requests", url: "/admin/withdrawals", icon: IconCash },
        { title: "All Transactions", url: "/admin/transactions", icon: IconTransfer },
        { title: "Announcements", url: "/admin/announcements", icon: IconSpeakerphone },
        { title: "Admin Support", url: "/admin/support", icon: IconHeadset },
        { title: "System Logs", url: "/admin/logs", icon: IconHistory },
    ],
    navSecondary: [
        { title: "Settings", url: "/settings", icon: IconSettings },
        { title: "Help", url: "/help", icon: IconHelp },
    ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    const userData = {
        name: user?.email.split('@')[0] || "Admin",
        email: user?.email || "admin@coinsafehub.com",
        avatar: "/avatars/admin.jpg",
    }

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/dashboard" className="flex items-center space-x-2">
                                <IconShieldLock className="size-6 text-[#1E3A8A]" />
                                <span className="text-lg font-bold text-[#1E3A8A]">
                                    CoinSafeHub Admin
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {data.navAdmin.map((item) => (
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

            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    )
}
