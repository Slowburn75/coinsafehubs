'use client'

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconDownload,
  IconFilter,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle, Loader2 } from "lucide-react"
import { orpc } from "@/lib/orpc"

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['deposit', 'withdrawal', 'bonus', 'referral', 'investment']),
  amount: z.number(),
  status: z.enum(['completed', 'pending', 'failed', 'cancelled']),
  reference: z.string().optional(),
  description: z.string().optional(),
})

export type Transaction = z.infer<typeof transactionSchema>

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'cancelled':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getTypeColor = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'withdrawal':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'bonus':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'referral':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'investment':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, "hh:mm a")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as Transaction['type']
      return (
        <Badge variant="outline" className={getTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const type = row.original.type
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Math.abs(amount))

      return (
        <div className={`text-right font-medium ${type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
          }`}>
          {type === 'withdrawal' ? '-' : '+'}{formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Transaction['status']
      return (
        <Badge variant="outline" className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string
      return (
        <div className="text-sm text-muted-foreground font-mono">
          {reference || 'N/A'}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            size="icon"
          >
            <IconDotsVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Download Receipt</DropdownMenuItem>
          {row.original.status === 'pending' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Cancel Transaction
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function TransactionHistoryTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data: rawData, isLoading, error: queryError, refetch } = useQuery(orpc.transactions.list.queryOptions());

  // Mapping strict backend schema to the table's expected format
  const filteredData = React.useMemo(() => {
    if (!rawData?.transactions) return [];

    let txs = rawData.transactions.map((tx: any) => ({
      id: tx.id,
      date: tx.createdAt as string,
      type: tx.type.toLowerCase(),
      amount: tx.amount,
      status: tx.status.toLowerCase(),
      reference: tx.reference || tx.id,
      description: tx.metadata ? JSON.stringify(tx.metadata) : undefined
    })) as Transaction[];

    if (typeFilter !== 'all') {
      txs = txs.filter(t => t.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      txs = txs.filter(t => t.status === statusFilter);
    }
    if (searchQuery) {
      txs = txs.filter(t => t.reference?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return txs;
  }, [rawData, typeFilter, statusFilter, searchQuery]);

  const handleSearch = React.useCallback(() => {
    // The useMemo automatically updates filteredData, but we can trigger refetch if desired
    refetch();
  }, [refetch])

  const handleExport = async () => {
    // In actual app, should hit export endpoint or use client side CSV generation
    console.log("Export triggered")
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (queryError) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Transactions</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">{queryError.message}</p>
          <Button
            onClick={() => refetch()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} size="icon" variant="outline">
            <IconSearch className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <IconFilter className="h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="interest">Interest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} size="icon" variant="outline">
            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={handleExport} size="icon" variant="outline">
            <IconDownload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pagination.pageIndex + 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage() || isLoading}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}