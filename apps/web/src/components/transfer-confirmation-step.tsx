'use client'

import { useRouter } from 'next/navigation'
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconMail,
  IconBolt,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TransferConfirmationStepProps {
  amount: string
  recipientEmail: string
  recipientName: string
  note: string
  transferReference: string
  onReset: () => void
}

export function TransferConfirmationStep({
  amount,
  recipientEmail,
  recipientName,
  note,
  transferReference,
  onReset,
}: TransferConfirmationStepProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(transferReference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadReceipt = () => {
    // This would generate and download a PDF receipt
    console.log('Downloading receipt...')
    // Implementation would go here
  }

  const numAmount = parseFloat(amount)

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Success Icon */}
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
          <IconCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold">Transfer Complete!</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Funds have been sent instantly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Keep this reference number for your records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reference Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Reference Number
            </label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="font-mono font-semibold text-lg flex-1">
                {transferReference}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyReference}
              >
                {copied ? (
                  <>
                    <IconCheck className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Transaction Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transfer Amount:</span>
              <span className="font-semibold text-lg">${numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Processing Fee:</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Recipient:</span>
              <div className="text-right">
                <p className="font-medium">{recipientName}</p>
                <p className="text-sm text-muted-foreground">{recipientEmail}</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">Amount Received:</span>
              <span className="font-bold text-green-600 text-2xl">
                ${numAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {note && (
            <>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Your Note
                </label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{note}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Status */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <IconBolt className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-green-900 dark:text-green-100">
                  Status:
                </span>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 border-green-300">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                The recipient has received the funds instantly in their coinsafehub wallet
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <IconMail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="font-medium text-blue-900 dark:text-blue-100">
                What's Next?
              </p>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200 ml-7">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>A notification email has been sent to {recipientEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>The recipient can see the transfer in their transaction history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>They can withdraw the funds anytime to their bank or wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Track this transfer in your transaction history</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={downloadReceipt} className="w-full">
              <IconDownload className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={copyReference} className="w-full">
              <IconCopy className="mr-2 h-4 w-4" />
              Copy Reference
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/transactions')}
            className="flex-1"
          >
            View Transactions
          </Button>
          <Button onClick={onReset} className="flex-1">
            Send Another Transfer
          </Button>
        </CardFooter>
      </Card>

      {/* Support Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need help with your transfer?
            </p>
            <Button variant="link" onClick={() => router.push('/dashboard/support')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
