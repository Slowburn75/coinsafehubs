'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    IconRefresh,
    IconChartLine,
    IconClock,
    IconCheck,
    IconX
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminInvestmentsPage() {
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.investments.list.queryOptions({
        input: { page: 1, limit: 50 }
    }))

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Global Investments</h2>
                    <p className="text-muted-foreground">
                        Monitor all user investment plans across the platform.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Investment Plans</CardTitle>
                    <CardDescription>
                        Real-time view of capital allocation and ROI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>ROI</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    data?.data.map((inv: any) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono text-xs">{inv.userId}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{inv.plan?.name || inv.planId}</Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(inv.amount)}</TableCell>
                                            <TableCell className="text-green-600">+{inv.roi}%</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={inv.status === 'ACTIVE' ? 'default' : inv.status === 'COMPLETED' ? 'secondary' : 'destructive'}
                                                >
                                                    {inv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && data?.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No global investments found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
