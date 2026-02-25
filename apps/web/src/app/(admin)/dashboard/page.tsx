'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import {
    IconUsers,
    IconChartBar,
    IconChartLine,
    IconArrowsExchange,
    IconRefresh,
} from "@tabler/icons-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2 } from "lucide-react"

export default function AdminDashboardPage() {
    const { data: stats, isLoading, error, refetch } = useQuery(orpc.admin.getStats.queryOptions())

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (error) {
        return (
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                        <AlertCircle className="size-8" />
                        Error Loading stats
                    </h2>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">Failed to fetch admin data</CardTitle>
                        <CardDescription className="text-red-600">
                            {(error as any).message || "You might not have permission to view this page."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const cards = [
        {
            title: "Total Assets Under Management",
            value: stats ? formatCurrency(stats.activeInvestmentVolume) : "$0",
            description: "Sum of all active investments",
            icon: <IconChartLine className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Total Registered Users",
            value: stats?.totalUsers.toString() || "0",
            description: "Total accounts in the system",
            icon: <IconUsers className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Active Investment Count",
            value: stats?.activeInvestmentVolume ? "Active" : "0", // We don't have count anymore in this schema, using volume as proxy or placeholder
            description: "Total volume of active plans",
            icon: <IconChartBar className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "Total Deposits All Time",
            value: stats ? formatCurrency(stats.totalDepositsAllTime) : "$0",
            description: "Total volume of completed deposits",
            icon: <IconArrowsExchange className="h-4 w-4 text-muted-foreground" />,
        },
    ]

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2"
                    >
                        <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? [...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-3 w-48 mt-2" />
                            </CardContent>
                        </Card>
                    ))
                    : cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>System Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Analytics visualization coming soon
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Admin Activity</CardTitle>
                        <CardDescription>
                            Latest audits from the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            No recent audit logs available
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
