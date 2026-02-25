'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    IconDotsVertical,
    IconCheck,
    IconX,
    IconRefresh,
    IconCurrencyDollar
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function AdminDepositsPage() {
    const queryClient = useQueryClient()
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.deposits.list.queryOptions({
        input: { page: 1, limit: 50, status: 'PENDING' }
    }))

    const approveMutation = useMutation(orpc.admin.deposits.approve.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.deposits.list.key() })
            toast.success("Deposit approved successfully")
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to approve deposit")
        }
    }))

    const rejectMutation = useMutation(orpc.admin.deposits.reject.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.deposits.list.key() })
            toast.success("Deposit rejected")
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to reject deposit")
        }
    }))

    const handleApprove = (transactionId: string) => {
        approveMutation.mutate({ transactionId })
    }

    const handleReject = (transactionId: string) => {
        const reason = window.prompt("Enter rejection reason:")
        if (reason) {
            rejectMutation.mutate({ transactionId, reason })
        }
    }

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
                    <h2 className="text-3xl font-bold tracking-tight">Deposit Management</h2>
                    <p className="text-muted-foreground">
                        Review and approve user deposit requests.
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
                    <CardTitle>Pending Deposits</CardTitle>
                    <CardDescription>
                        All deposits currently awaiting administrative verification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                    data?.data.map((deposit: any) => (
                                        <TableRow key={deposit.id}>
                                            <TableCell className="font-medium text-xs">{deposit.user?.email || deposit.userId}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(deposit.amount)}</TableCell>
                                            <TableCell className="font-mono text-xs">{deposit.reference}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={deposit.status === 'PENDING' ? 'secondary' : 'default'}
                                                >
                                                    {deposit.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(deposit.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <IconDotsVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleApprove(deposit.id)} className="text-green-600">
                                                            <IconCheck className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReject(deposit.id)} className="text-red-600">
                                                            <IconX className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && data?.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No pending deposits found
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
