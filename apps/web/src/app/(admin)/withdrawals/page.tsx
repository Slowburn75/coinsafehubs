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
    IconFlag,
    IconAlertCircle
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function AdminWithdrawalsPage() {
    const queryClient = useQueryClient()
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.withdrawals.list.queryOptions({
        input: { page: 1, limit: 50, status: 'PENDING' }
    }))

    const approveMutation = useMutation(orpc.admin.withdrawals.approve.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.withdrawals.list.key() })
            toast.success("Withdrawal approved and processed")
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to approve withdrawal")
        }
    }))

    const rejectMutation = useMutation(orpc.admin.withdrawals.reject.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.withdrawals.list.key() })
            toast.success("Withdrawal rejected")
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to reject withdrawal")
        }
    }))

    const flagMutation = useMutation(orpc.admin.withdrawals.flag.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.withdrawals.list.key() })
            toast.success("Withdrawal flagged for review")
        }
    }))

    const handleApprove = (transactionId: string) => {
        if (window.confirm("Are you sure you want to approve this withdrawal? Funds will be deducted immediately.")) {
            approveMutation.mutate({ transactionId })
        }
    }

    const handleReject = (transactionId: string) => {
        const reason = window.prompt("Enter rejection reason:")
        if (reason) {
            rejectMutation.mutate({ transactionId, reason })
        }
    }

    const handleFlag = (transactionId: string) => {
        const note = window.prompt("Enter internal note for flagging:")
        if (note) {
            flagMutation.mutate({ transactionId, note })
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
                    <h2 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h2>
                    <p className="text-muted-foreground">
                        Manage user payout requests and prevent fraud.
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
                    <CardTitle>Pending Payouts</CardTitle>
                    <CardDescription>
                        Payouts awaiting security review and disbursement.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
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
                                    data?.data.map((withdrawal: any) => (
                                        <TableRow key={withdrawal.id}>
                                            <TableCell className="font-medium text-xs">{withdrawal.user?.email || withdrawal.userId}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(withdrawal.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{withdrawal.metadata?.method || 'Standard'}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs truncate max-w-[100px]">
                                                {withdrawal.reference}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
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
                                                        <DropdownMenuItem onClick={() => handleApprove(withdrawal.id)} className="text-green-600">
                                                            <IconCheck className="mr-2 h-4 w-4" />
                                                            Approve & Pay
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleFlag(withdrawal.id)} className="text-yellow-600">
                                                            <IconFlag className="mr-2 h-4 w-4" />
                                                            Flag for Review
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReject(withdrawal.id)} className="text-red-600">
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
                                            No pending withdrawals found
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
