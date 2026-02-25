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
    IconEdit,
    IconTrash,
    IconEye,
    IconEyeOff
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPlansPage() {
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const { data, isLoading, error, refetch } = useQuery((orpc.admin.plans.list as any).queryOptions())

    const createMutation = useMutation(orpc.admin.plans.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.plans.list.key() })
            setIsCreateOpen(false)
            toast.success("Investment plan created")
        }
    }))

    const toggleMutation = useMutation((orpc.admin.plans.toggleActive as any).mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: (orpc.admin.plans.list as any).key() })
            toast.success("Plan visibility toggled")
        }
    }))

    const deleteMutation = useMutation(orpc.admin.plans.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.plans.list.key() })
            toast.success("Plan deleted")
        }
    }))

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const payload = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            minimumAmount: Number(formData.get('minimumAmount')),
            maximumAmount: Number(formData.get('maximumAmount')),
            roiPercent: Number(formData.get('roiPercent')),
            durationDays: Number(formData.get('durationDays')),
            riskLevel: formData.get('riskLevel') as 'LOW' | 'MEDIUM' | 'HIGH',
            isActive: true,
            isFeatured: false,
            isArchived: false,
            displayOrder: 0
        }
        createMutation.mutate(payload as any)
    }

    const handleDelete = (id: string) => {
        if (window.confirm("Permanently delete this plan? This action cannot be undone.")) {
            deleteMutation.mutate({ id })
        }
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">Error: {(error as any).message}</div>
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Investment Plans</h2>
                    <p className="text-muted-foreground">
                        Configure and manage the investment products available to users.
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
                                Create Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Investment Plan</DialogTitle>
                                <DialogDescription>
                                    Add a new financial product to the platform.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Plan Name</Label>
                                        <Input id="name" name="name" placeholder="e.g. Starter Gold" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="riskLevel">Risk Level</Label>
                                        <Select name="riskLevel" defaultValue="LOW">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low Risk</SelectItem>
                                                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                                                <SelectItem value="HIGH">High Risk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" name="description" placeholder="Brief tagline" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minimumAmount">Min Investment ($)</Label>
                                        <Input id="minimumAmount" name="minimumAmount" type="number" defaultValue="100" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maximumAmount">Max Investment ($)</Label>
                                        <Input id="maximumAmount" name="maximumAmount" type="number" defaultValue="1000" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="roiPercent">ROI (%)</Label>
                                        <Input id="roiPercent" name="roiPercent" type="number" step="0.1" defaultValue="5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="durationDays">Duration (Days)</Label>
                                        <Input id="durationDays" name="durationDays" type="number" defaultValue="30" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Creating..." : "Save Plan"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Catalog</CardTitle>
                    <CardDescription>
                        Active and archived investment configurations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>ROI</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Limits</TableHead>
                                    <TableHead>Risk</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    (data as any)?.plans.map((plan: any) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-bold">{plan.name}</TableCell>
                                            <TableCell className="text-green-600 font-semibold">{plan.roiPercent}%</TableCell>
                                            <TableCell>{plan.durationDays} Days</TableCell>
                                            <TableCell className="text-xs">
                                                ${plan.minimumAmount} - ${plan.maximumAmount}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{plan.riskLevel}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                                    {plan.isActive ? 'Visible' : 'Hidden'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => (toggleMutation as any).mutate({ id: plan.id, active: !plan.isActive })}
                                                >
                                                    {plan.isActive ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(plan.id)}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
