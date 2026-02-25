'use client'

import React, { useState } from 'react'
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    IconRefresh,
    IconPlus,
    IconTrash,
    IconSpeakerphone,
    IconHistory
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminAnnouncementsPage() {
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const { data, isLoading, error, refetch } = useQuery((orpc.admin.announcements.list as any).queryOptions())

    const createMutation = useMutation(orpc.admin.announcements.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.announcements.list.key() })
            setIsCreateOpen(false)
            toast.success("Announcement published")
        }
    }))

    const deleteMutation = useMutation(orpc.admin.announcements.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.announcements.list.key() })
            toast.success("Announcement removed")
        }
    }))

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const payload = {
            title: formData.get('title') as string,
            body: formData.get('body') as string,
            type: formData.get('type') as 'INFO' | 'WARNING' | 'MAINTENANCE' | 'PROMOTION',
            isActive: true,
            targetAll: true
        }
        createMutation.mutate(payload as any)
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Announcements</h2>
                    <p className="text-muted-foreground">
                        Broadcast important updates and alerts to all users.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <IconPlus className="h-4 w-4" />
                                New Announcement
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Broadcast Announcement</DialogTitle>
                                <DialogDescription>
                                    This message will be visible to all users upon their next login.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Subject / Title</Label>
                                    <Input id="title" name="title" placeholder="e.g. Scheduled Maintenance" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="body">Message Body</Label>
                                    <Textarea id="body" name="body" placeholder="Details of the announcement..." required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Alert Type</Label>
                                    <select name="type" className="w-full rounded-md border border-input px-3 py-2 text-sm" defaultValue="INFO">
                                        <option value="INFO">Information (Blue)</option>
                                        <option value="WARNING">Warning (Amber)</option>
                                        <option value="MAINTENANCE">Maintenance (Red)</option>
                                        <option value="PROMOTION">Promotion (Green)</option>
                                    </select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Publishing..." : "Broadcast Now"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Message History</CardTitle>
                    <CardDescription>
                        Previous and active platform-wide broadcasts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    (data as any)?.announcements.map((msg: any) => (
                                        <TableRow key={msg.id}>
                                            <TableCell>
                                                <Badge variant={msg.type === 'INFO' ? 'secondary' : msg.type === 'WARNING' ? 'destructive' : 'default'}>
                                                    {msg.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{msg.title}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500"
                                                    onClick={() => deleteMutation.mutate({ id: msg.id })}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && (data as any)?.announcements.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <IconHistory className="h-8 w-8 opacity-20" />
                                                <p>No broadcast history found</p>
                                            </div>
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
