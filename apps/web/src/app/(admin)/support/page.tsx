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
    IconClock,
    IconMessage,
    IconRefresh,
    IconX
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminSupportPage() {
    const queryClient = useQueryClient()
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.support.list.queryOptions({
        input: { page: 1, limit: 50 }
    }))

    const updateStatusMutation = useMutation(orpc.admin.support.updateStatus.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.support.list.key() })
        }
    }))

    const handleUpdateStatus = (ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
        updateStatusMutation.mutate({ ticketId, status })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <Badge variant="destructive">Open</Badge>
            case 'IN_PROGRESS': return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
            case 'RESOLVED': return <Badge variant="default" className="bg-green-500">Resolved</Badge>
            case 'CLOSED': return <Badge variant="secondary">Closed</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
                    <p className="text-muted-foreground">
                        Manage and respond to user support inquiries.
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
                    <CardTitle>All Active Tickets</CardTitle>
                    <CardDescription>
                        Manage support requests from across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    data?.data.map((ticket: any) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-mono text-xs">{ticket.userId}</TableCell>
                                            <TableCell className="max-w-[300px] truncate font-medium">
                                                {ticket.subject}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <IconDotsVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}>
                                                            <IconClock className="mr-2 h-4 w-4 text-blue-500" />
                                                            Mark In Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}>
                                                            <IconCheck className="mr-2 h-4 w-4 text-green-500" />
                                                            Mark Resolved
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}>
                                                            <IconX className="mr-2 h-4 w-4 text-gray-500" />
                                                            Close Ticket
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <IconMessage className="mr-2 h-4 w-4" />
                                                            Open Interaction
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && data?.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No support tickets found
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

export default AdminSupportPage
