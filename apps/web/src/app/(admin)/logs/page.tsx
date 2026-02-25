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
    IconHistory,
    IconSearch,
    IconFilter
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLogsPage() {
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.audit.list.queryOptions({
        input: { page: 1, limit: 100 }
    }))

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                    <p className="text-muted-foreground">
                        Audit trail of sensitive actions and system events.
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
                    <Input placeholder="Search logs..." className="pl-9" />
                </div>
                <Button variant="outline" className="gap-2">
                    <IconFilter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                    <CardDescription>
                        Showing the last 100 system events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    data?.data.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{log.userId || 'System'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{log.entity}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground font-mono">
                                                {log.ipAddress || '---'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && data?.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No logs found
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
