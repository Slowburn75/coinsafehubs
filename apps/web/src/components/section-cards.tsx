'use client'

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  IconWallet,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconGift,
  IconUsers,
  IconRefresh,
  IconTrendingUp,
  IconChartLine
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { orpc } from "@/lib/orpc"

interface AccountSummary {
  account_balance: number
  total_deposit: number
  total_withdrawal: number
  bonus: number
  referral_bonus: number
  recovered_balance: number
  profit_bonus: number
  investment_balance: number
}

interface CardData {
  label: string
  key: keyof AccountSummary
  icon: React.ReactNode
  description: string
}

export function SectionCards() {
  const { data: invData, isLoading: invLoading, error: invError, refetch: refetchInv } = useQuery(orpc.investments.list.queryOptions());
  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = useQuery(orpc.transactions.list.queryOptions());

  const handleRefresh = () => {
    refetchInv();
    refetchTx();
  }

  const isLoading = invLoading || txLoading;
  const error = invError || txError;

  const summary = useMemo<AccountSummary>(() => {
    let total_deposit = 0;
    let total_withdrawal = 0;
    let investment_balance = 0;

    if (txData?.transactions) {
      txData.transactions.forEach((tx: any) => {
        if (tx.status === 'COMPLETED') {
          if (tx.type === 'DEPOSIT') total_deposit += Number(tx.amount);
          if (tx.type === 'WITHDRAWAL') total_withdrawal += Number(tx.amount);
        }
      });
    }

    if (invData?.investments) {
      invData.investments.forEach((inv: any) => {
        if (inv.status === 'ACTIVE') {
          investment_balance += Number(inv.amount);
        }
      });
    }

    // Account Balance = Deposits - Withdrawals - Investments
    const account_balance = Math.max(0, total_deposit - total_withdrawal - investment_balance);

    return {
      account_balance,
      total_deposit,
      total_withdrawal,
      investment_balance,
      // Mocked zeros for unused features right now, can map correctly if metadata used
      bonus: 0,
      referral_bonus: 0,
      recovered_balance: 0,
      profit_bonus: 0
    }
  }, [invData, txData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const cardConfigs: CardData[] = [
    {
      label: "Account Balance",
      key: "account_balance",
      icon: <IconWallet className="size-5" />,
      description: "Your available balance to invest or withdraw"
    },
    {
      label: "Total Deposits",
      key: "total_deposit",
      icon: <IconArrowDownLeft className="size-5" />,
      description: "All-time deposits"
    },
    {
      label: "Total Withdrawals",
      key: "total_withdrawal",
      icon: <IconArrowUpRight className="size-5" />,
      description: "All-time withdrawals"
    },
    {
      label: "Investment",
      key: "investment_balance",
      icon: <IconChartLine className="size-5" />,
      description: "Capital deposited in active investment plans"
    }
  ]

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              <CardTitle className="text-lg">Error Loading Account Summary</CardTitle>
            </div>
            <CardDescription className="text-red-600">{error.message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <button
              onClick={handleRefresh}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Try Again
            </button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="px-4 lg:px-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>Dashboard summary is live</span>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <IconRefresh className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cardConfigs.map((config) => {
          const value = summary?.[config.key] ?? 0
          const isPositiveMetric = !['total_withdrawal'].includes(config.key)
          const isIncrease = value > 0

          return (
            <Card key={config.key} className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatCurrency(value)}
                </CardTitle>
                <CardAction>
                  {value > 0 && (
                    <Badge
                      variant="outline"
                      className={
                        isPositiveMetric && isIncrease
                          ? "text-green-600 border-green-200 bg-green-50"
                          : !isPositiveMetric && isIncrease
                            ? "text-red-600 border-red-200 bg-red-50"
                            : "text-gray-600 border-gray-200 bg-gray-50"
                      }
                    >
                      {isIncrease ? <IconTrendingUp /> : <IconArrowDownLeft />}
                      Active
                    </Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  {config.description}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}