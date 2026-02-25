'use client'

import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface TransferSummaryCardProps {
  amount: string
  recipientEmail: string
  className?: string
}

export function TransferSummaryCard({
  amount,
  recipientEmail,
  className = '',
}: TransferSummaryCardProps) {
  const numAmount = parseFloat(amount || '0')
  
  if (!amount || numAmount <= 0) {
    return null
  }

  return (
    <Card className={`${className} sticky top-24`}>
      <CardHeader>
        <CardTitle className="text-lg">Transfer Summary</CardTitle>
        <CardDescription>Review your transfer details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Transfer Amount:</span>
            <span className="font-semibold">${numAmount.toFixed(2)}</span>
          </div>

          {recipientEmail && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recipient Email:</span>
                <span className="text-sm font-medium truncate ml-2">
                  {recipientEmail}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Processing Fee:</span>
                <span className="text-sm font-semibold text-green-600">
                  Free
                </span>
              </div>
            </>
          )}

          {recipientEmail && <Separator />}

          {recipientEmail && (
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium">Recipient Receives:</span>
              <span className="font-bold text-green-600 text-xl">
                ${numAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Info/Warning Messages */}
        {recipientEmail && (
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs">
              <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 dark:text-blue-200">
                Transfers are instant and completely free between coinsafehub users.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-xs">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                The recipient will receive an email notification about the transfer.
              </p>
            </div>
          </div>
        )}

        {!recipientEmail && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Enter recipient email to see transfer details
          </div>
        )}
      </CardContent>
    </Card>
  )
}
