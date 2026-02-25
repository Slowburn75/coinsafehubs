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
    IconSearch,
    IconFilter,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTransactionsPage() {
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.transactions.list.queryOptions({
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
                    <h2 className="text-3xl font-bold tracking-tight">Financial Ledger</h2>
                    <p className="text-muted-foreground">
                        A comprehensive history of all platform-wide financial activity.
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

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by reference..." className="pl-9" />
                </div>
                <Button variant="outline" className="gap-2">
                    <IconFilter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        Unified view of deposits, withdrawals, and internal transfers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    data?.data.map((tx: any) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-mono text-xs uppercase">{tx.reference}</TableCell>
                                            <TableCell className="text-xs">{tx.user?.email || tx.userId}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={tx.type === 'DEPOSIT' ? 'border-green-500 text-green-600' : tx.type === 'WITHDRAWAL' ? 'border-amber-500 text-amber-600' : ''}
                                                >
                                                    {tx.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(tx.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant={tx.status === 'COMPLETED' ? 'default' : tx.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && data?.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No transactions recorded
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
