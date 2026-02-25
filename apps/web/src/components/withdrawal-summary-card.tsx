'use client'

import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WithdrawalMethod } from '@/components/withdrawal-method-step'

interface WithdrawalSummaryCardProps {
  amount: string
  method: WithdrawalMethod | null
  className?: string
}

export function WithdrawalSummaryCard({
  amount,
  method,
  className = '',
}: WithdrawalSummaryCardProps) {
  const numAmount = parseFloat(amount || '0')
  
  if (!amount || numAmount <= 0) {
    return null
  }

  const fee = method
    ? method.feeType === 'flat'
      ? method.feeValue
      : (numAmount * method.feeValue) / 100
    : 0

  const netAmount = numAmount - fee

  return (
    <Card className={`${className} sticky top-24`}>
      <CardHeader>
        <CardTitle className="text-lg">Withdrawal Summary</CardTitle>
        <CardDescription>Review your withdrawal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Withdrawal Amount:</span>
            <span className="font-semibold">${numAmount.toFixed(2)}</span>
          </div>

          {method && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Withdrawal Method:</span>
                <Badge variant="outline" className="text-xs">
                  {method.name}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction Fee:</span>
                <span className="text-sm text-muted-foreground">
                  ${fee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Processing Time:</span>
                <span className="text-sm text-muted-foreground">
                  {method.processingTime}
                </span>
              </div>
            </>
          )}

          {method && <Separator />}

          {method && (
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium">You'll Receive:</span>
              <span className="font-bold text-green-600 text-xl">
                ${netAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Info/Warning Messages */}
        {method && (
          <div className="space-y-3 pt-2">
            {method.type === 'crypto' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs">
                <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-200">
                  Withdrawals to {method.name} addresses are irreversible. Double-check the address before submitting.
                </p>
              </div>
            )}

            {method.type === 'bank' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs">
                <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-200">
                  Bank transfers may take 1-3 business days. Ensure account details are correct.
                </p>
              </div>
            )}

            {numAmount < method.minAmount && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-xs">
                <IconAlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  Minimum withdrawal for {method.name} is ${method.minAmount}
                </p>
              </div>
            )}

            {numAmount > method.maxAmount && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs">
                <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200">
                  Maximum withdrawal for {method.name} is ${method.maxAmount.toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-xs">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                All withdrawals are verified for your security. Funds will be sent once verification is complete.
              </p>
            </div>
          </div>
        )}

        {!method && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Select a withdrawal method to see fee breakdown
          </div>
        )}
      </CardContent>
    </Card>
  )
}
