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
    IconClock,
    IconRefresh,
    IconSnowflake,
    IconFlame,
    IconEdit,
    IconTrash
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from 'lucide-react'

export function UserTable() {
    const queryClient = useQueryClient()
    const [page, setPage] = React.useState(1)
    const { data, isLoading, error, refetch } = useQuery(orpc.admin.users.list.queryOptions({
        input: { page, limit: 10 }
    }))

    const freezeMutation = useMutation(orpc.admin.users.freeze.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.users.list.key() })
        }
    }))

    const kycMutation = useMutation(orpc.admin.users.updateKyc.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.users.list.key() })
        }
    }))

    const handleUpdateKyc = (userId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING') => {
        kycMutation.mutate({ userId, status })
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data.map((user: any) => (
                        <TableRow key={user.id} className={!user.isActive ? 'opacity-60 bg-muted/30' : ''}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {user.email}
                                    {!user.isActive && <Badge variant="secondary" className="text-[10px] h-4">FROZEN</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.kycStatus === 'VERIFIED' ? 'default' : user.kycStatus === 'REJECTED' ? 'destructive' : 'secondary'}
                                    className={user.kycStatus === 'VERIFIED' ? 'bg-green-500 hover:bg-green-600' : ''}
                                >
                                    {user.kycStatus || 'PENDING'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <IconDotsVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleUpdateKyc(user.id, 'VERIFIED')}>
                                            <IconCheck className="mr-2 h-4 w-4 text-green-600" />
                                            Verify KYC
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateKyc(user.id, 'REJECTED')}>
                                            <IconX className="mr-2 h-4 w-4 text-red-600" />
                                            Reject KYC
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateKyc(user.id, 'PENDING')}>
                                            <IconClock className="mr-2 h-4 w-4 text-yellow-600" />
                                            Reset to Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => freezeMutation.mutate({ userId: user.id, freeze: user.isActive })}>
                                            {user.isActive ? (
                                                <><IconSnowflake className="mr-2 h-4 w-4 text-blue-600" /> Freeze Account</>
                                            ) : (
                                                <><IconFlame className="mr-2 h-4 w-4 text-orange-600" /> Unfreeze Account</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                            <IconTrash className="mr-2 h-4 w-4" />
                                            Soft Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                    Page {data?.page} of {data?.totalPages} ({data?.total} users)
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= (data?.totalPages || 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function UsersPage() {
    const { refetch, isLoading } = useQuery(orpc.admin.users.list.queryOptions({
        input: { page: 1, limit: 50 }
    }))

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage user accounts and KYC verification status.
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
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all users registered in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTable />
                </CardContent>
            </Card>
        </div>
    )
}
